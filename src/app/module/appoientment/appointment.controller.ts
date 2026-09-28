import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { AppointmentServices } from "./appointment.service";
import type { IRequestUser } from "../auth/auth.interface";

// create appointment
const bookAppointment = catchAsync(async (req: Request, res: Response) => {
  const result = await AppointmentServices.bookAppointment(
    req.body,
    req.user as IRequestUser,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Appointment booked successfully",
    data: result,
  });
});

// pay appointment
const payAppointment = catchAsync(async (req: Request, res: Response) => {
  const result = await AppointmentServices.payAppointment(
    req.body,
    req.user as IRequestUser,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Appointment payment initiated successfully",
    data: result,
  });
});

// book appointment call back
const bookAppointmentCallback = catchAsync(
  async (req: Request, res: Response) => {
    console.log("request query", req.query);
    const { executedPaymentResult, redirectUrl } =
      await AppointmentServices.bookAppointmentCallback(req.query);

    if (!redirectUrl) {
      throw new Error("Missing redirect url!");
    }

    res.redirect(redirectUrl);

    console.log("execute data", executedPaymentResult);
  },
);

// cancel appointment
const cancelAppointment = catchAsync(async (req: Request, res: Response) => {
  const result = await AppointmentServices.cancelAppointment(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Appointment cancelled successfully",
    data: result,
  });
});

export const appointmentsControllers = {
  bookAppointment,
  payAppointment,
  bookAppointmentCallback,
  cancelAppointment,
};
