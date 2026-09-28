import httpStatus from "http-status";
import {
	AppointmentStatus,
	PaymentStatus,
} from "../../../generated/prisma/enums";
import config from "../../config";
import AppError from "../../errors/AppError";
import { getBkashIdToken } from "../../lib/bkash";
import { prisma } from "../../lib/prisma";
import type { IRequestUser } from "../auth/auth.interface";

const bookAppointment = async (payload: any, user: IRequestUser) => {
	const transactionResult = await prisma.$transaction(async (tx) => {
		// business logic

		const appointment = await tx.appointment.create({
			data: {
				status: AppointmentStatus.PENDING,
			},
		});

		const bkashIdToken = await getBkashIdToken();

		if (!bkashIdToken) {
			throw new AppError(
				httpStatus.BAD_GATEWAY,
				"No Bkash Access Token Found!",
			);
		}

		const callbackURL = `${config.bkash.callbackUrl || `${config.backendUrl}/api/v1`}/appointment/book-appointment/payment/callback`;

		const bkashCreatePaymentResponse = await fetch(
			`${config.bkash.sandboxBaseUrl}/tokenized/checkout/create`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
					Authorization: bkashIdToken,
					"X-App-Key": config.bkash.appKey as string,
				},
				body: JSON.stringify({
					mode: "0011",
					payerReference:
						user?.email || payload?.email || "patient@mediconnect.com",
					callbackURL,
					amount: payload?.amount ? String(payload.amount) : "1200",
					currency: "BDT",
					intent: "sale",
					merchantInvoiceNumber: appointment.id,
				}),
			},
		);

		const bkashCreatePaymentResult = await bkashCreatePaymentResponse.json();

		// payment model create
		await tx.payment.create({
			data: {
				merchantInvoiceNumber:
					bkashCreatePaymentResult.merchantInvoiceNumber || appointment.id,
				appointmentId: appointment.id,
				amount: payload?.amount ? String(payload.amount) : "1200",
				gatewayResponse: bkashCreatePaymentResult,
				bkashPaymentId: bkashCreatePaymentResult.paymentID,
				payerReference:
					user?.email || payload?.email || "patient@mediconnect.com",
			},
		});

		return {
			paymentUrl: bkashCreatePaymentResult.bkashURL,
		};
	});

	return transactionResult;
};

const payAppointment = async (payload: any, user: IRequestUser) => {
	const appointmentId = payload.appointmentId;

	const existingAppointment = await prisma.appointment.findUnique({
		where: {
			id: appointmentId,
		},
	});

	if (!existingAppointment) {
		throw new AppError(httpStatus.NOT_FOUND, "Appointment Does Not Exists");
	}

	if (existingAppointment.status !== AppointmentStatus.PENDING) {
		throw new AppError(httpStatus.BAD_REQUEST, "Appointment Is Not Pending!");
	}

	const bkashIdToken = await getBkashIdToken();

	if (!bkashIdToken) {
		throw new AppError(httpStatus.BAD_GATEWAY, "No Bkash Access Token Found!");
	}

	const callbackURL = `${config.bkash.callbackUrl || `${config.backendUrl}/api/v1`}/appointment/book-appointment/payment/callback`;

	const bkashCreatePaymentResponse = await fetch(
		`${config.bkash.sandboxBaseUrl}/tokenized/checkout/create`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
				Authorization: bkashIdToken,
				"X-App-Key": config.bkash.appKey as string,
			},
			body: JSON.stringify({
				mode: "0011",
				payerReference:
					user?.email || payload?.email || "patient@mediconnect.com",
				callbackURL,
				amount: payload?.amount ? String(payload.amount) : "1200",
				currency: "BDT",
				intent: "sale",
				merchantInvoiceNumber: existingAppointment.id,
			}),
		},
	);

	const bkashCreatePaymentResult = await bkashCreatePaymentResponse.json();

	await prisma.payment.update({
		where: {
			appointmentId: existingAppointment.id,
		},
		data: {
			merchantInvoiceNumber:
				bkashCreatePaymentResult.merchantInvoiceNumber ||
				existingAppointment.id,
			gatewayResponse: bkashCreatePaymentResult,
			bkashPaymentId: bkashCreatePaymentResult.paymentID,
		},
	});

	return {
		paymentUrl: bkashCreatePaymentResult.bkashURL,
	};
};

const bookAppointmentCallback = async (query: Record<string, any>) => {
	const transactionResult = await prisma.$transaction(async (tx) => {
		const paymentId = query.paymentID;

		if (!paymentId) {
			throw new AppError(httpStatus.BAD_REQUEST, "Payment Id Missing");
		}

		const status = query.status;

		if (!status) {
			throw new AppError(httpStatus.BAD_REQUEST, "Payment Status is Missing");
		}

		const bkashIdToken = await getBkashIdToken();

		if (!bkashIdToken) {
			throw new AppError(
				httpStatus.BAD_GATEWAY,
				"No Bkash Access Token Found!",
			);
		}

		const executedPaymentResponse = await fetch(
			`${config.bkash.sandboxBaseUrl}/tokenized/checkout/execute`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
					Authorization: bkashIdToken,
					"X-App-Key": config.bkash.appKey as string,
				},
				body: JSON.stringify({
					paymentID: paymentId,
				}),
			},
		);

		const executedPaymentResult = await executedPaymentResponse.json();

		if (status === "success") {
			const appointmentId = executedPaymentResult.merchantInvoiceNumber;
			if (appointmentId) {
				await tx.appointment.update({
					where: {
						id: appointmentId,
					},
					data: {
						status: AppointmentStatus.CONFIRMED,
					},
				});
			}

			await tx.payment.update({
				where: {
					bkashPaymentId: paymentId,
				},
				data: {
					status: PaymentStatus.PAID,
					bkashTRXId: executedPaymentResult.trxID,
					paidAt: executedPaymentResult.paymentExecuteTime,
					gatewayResponse: executedPaymentResult,
				},
			});

			return {
				executedPaymentResult,
				redirectUrl: `${config.frontendUrl}/dashboard/my-appointments?status=success`,
			};
		} else if (status === "failure") {
			await tx.payment.update({
				where: {
					bkashPaymentId: paymentId,
				},
				data: {
					status: PaymentStatus.FAILED,
					gatewayResponse: executedPaymentResult,
				},
			});
			return {
				executedPaymentResult,
				redirectUrl: `${config.frontendUrl}/dashboard/my-appointments?status=failure`,
			};
		} else if (status === "cancel") {
			await tx.payment.update({
				where: {
					bkashPaymentId: paymentId,
				},
				data: {
					status: PaymentStatus.CANCELLED,
					gatewayResponse: executedPaymentResult,
				},
			});
			return {
				executedPaymentResult,
				redirectUrl: `${config.frontendUrl}/dashboard/my-appointments?status=cancel`,
			};
		} else {
			return {
				executedPaymentResult,
				redirectUrl: `${config.frontendUrl}/dashboard/my-appointments?error=payment-failed`,
			};
		}
	});

	return transactionResult;
};

const cancelAppointment = async (payload: any) => {
	const transactionResult = await prisma.$transaction(async (tx) => {
		const appointmentId = payload.appointmentId;

		const existingAppointment = await tx.appointment.findUnique({
			where: {
				id: appointmentId,
			},
			include: {
				payment: true,
			},
		});

		if (!existingAppointment) {
			throw new AppError(httpStatus.NOT_FOUND, "Appointment Does Not Exists");
		}

		if (
			existingAppointment.status === AppointmentStatus.ONGOING ||
			existingAppointment.status === AppointmentStatus.COMPLETED
		) {
			throw new AppError(
				httpStatus.BAD_REQUEST,
				"Appointment Ongoing or Completed",
			);
		}

		if (existingAppointment.status === AppointmentStatus.CANCELLED) {
			throw new AppError(
				httpStatus.BAD_REQUEST,
				"Appointment Already Cancelled",
			);
		}

		const updatedAppointment = await tx.appointment.update({
			where: {
				id: existingAppointment.id,
			},
			data: {
				status: AppointmentStatus.CANCELLED,
			},
		});

		const bkashIdToken = await getBkashIdToken();

		if (!bkashIdToken) {
			throw new AppError(
				httpStatus.BAD_GATEWAY,
				"No Bkash Access Token Found!",
			);
		}

		const bkashRefundPaymentResponse = await fetch(
			`${config.bkash.sandboxBaseUrl}/tokenized/checkout/payment/refund`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
					Authorization: bkashIdToken,
					"X-App-Key": config.bkash.appKey as string,
				},
				body: JSON.stringify({
					paymentID: existingAppointment.payment?.bkashPaymentId,
					trxID: existingAppointment.payment?.bkashTRXId,
					amount: existingAppointment.payment?.amount
						? existingAppointment.payment.amount.toString()
						: "1200",
					sku: "Appointment Cancellation",
					reason: "Patient Cancelled The Appointment",
				}),
			},
		);

		const bkashRefundPaymentResult = await bkashRefundPaymentResponse.json();

		const updatedPayment = await tx.payment.update({
			where: {
				appointmentId: existingAppointment.id,
			},
			data: {
				refundTrxId: bkashRefundPaymentResult.refundTrxID,
				refundAt: bkashRefundPaymentResult.completedTime
					? new Date(bkashRefundPaymentResult.completedTime)
					: new Date(),
				refundAmount: bkashRefundPaymentResult.amount,
				refundReason: "Patient Cancelled The Appointment",
				status: PaymentStatus.REFUNDED,
				gatewayResponse: bkashRefundPaymentResult,
			},
		});

		return {
			appointment: updatedAppointment,
			payment: updatedPayment,
		};
	});

	return transactionResult;
};

export const AppointmentServices = {
	bookAppointment,
	payAppointment,
	bookAppointmentCallback,
	cancelAppointment,
};
