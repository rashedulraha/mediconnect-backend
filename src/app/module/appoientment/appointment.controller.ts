import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import statuscode from "http-status";
import { bookAppointmentService } from "./appointment.service";

// create appointment
const bookAppointment = catchAsync(async (req: Request, res: Response) => {
  const result = await bookAppointmentService.bookAppointment();
  sendResponse(res, {
    statusCode: statuscode.OK,
    success: true,
    message: "User profile fetch successfully",
    data: result,
  });
});

// boot appointment call back
const bookAppointmentCallback = catchAsync(
  async (req: Request, res: Response) => {
    console.log("request query", req.query);
    const { executedPaymentResult, redirectURL } =
      await bookAppointmentService.bookAppointmentCallback(req.query);

    if (!redirectURL) {
      throw new Error("Missing redirect url!");
    }

    res.redirect(redirectURL);

    console.log("execute data", executedPaymentResult);
  },
);

export const appointmentsControllers = {
  bookAppointment,
  bookAppointmentCallback,
};
