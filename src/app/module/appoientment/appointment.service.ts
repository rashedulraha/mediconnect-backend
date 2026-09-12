import { json } from "zod";
import config from "../../config";
import { getBkashIdToken } from "../../lib/bkash";

// create book appointment
const bookAppointment = async () => {
  // business logic

  // create bkash id token
  const bkashIdToken = await getBkashIdToken();

  if (!bkashIdToken) {
    throw new Error("No bkash access token found!");
  }

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
        //agreementID: "TokenizedMerchant01L3IKB6H1565072174986", // appointment id
        mode: "0011",
        payerReference: "01723888888", // user email and phone
        callbackURL: `${config.bkash.callbackUrl}/appointment/book-appointment/payment/callback`,
        merchantAssociationInfo: "MI05MID54RF09123456One",
        amount: "1200",
        currency: "BDT",
        intent: "sale",
        merchantInvoiceNumber: "Inv012435", //appointment id
      }),
    },
  );

  // result

  const bkashCreatePaymentResponseResult =
    await bkashCreatePaymentResponse.json();

  return bkashCreatePaymentResponseResult;
};

const bookAppointmentCallback = async (query: Record<string, any>) => {
  const paymentId = await query.paymentID;
  if (!paymentId) {
    throw new Error("payment id missing !");
  }
  const status = query.status;
  if (!status) {
    throw new Error("payment status  is missing !");
  }

  // create bkash grant token
  const bkashGrantToken = await getBkashIdToken();

  if (!bkashGrantToken) {
    throw new Error("bkash grant token missing!");
  }

  // execute payment
  const executePayment = await fetch(
    `${config.bkash.sandboxBaseUrl}/tokenized/checkout/execute`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: bkashGrantToken,
        "X-App-Key": config.bkash.appKey as string,
      },
      body: JSON.stringify({
        paymentID: paymentId,
      }),
    },
  );

  const executedPaymentResult = await executePayment.json();

  // check status   success
  if (status === "success") {
    return {
      executedPaymentResult,
      redirectURL: `${config.frontendUrl}/dashboard/my-appointments?status=success`,
    };
  }

  // check status failure
  if (status === "failure") {
    return {
      executedPaymentResult,
      redirectURL: `${config.frontendUrl}/dashboard/my-appointments?status=failure`,
    };
  }

  // check status cancel
  if (status === "cancel") {
    return {
      executedPaymentResult,
      redirectURL: `${config.frontendUrl}/dashboard/my-appointments`,
    };
  }

  return {};
};

export const bookAppointmentService = {
  bookAppointment,
  bookAppointmentCallback,
};
