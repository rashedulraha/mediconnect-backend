import type { Request, Response } from "express";
import httpStatus from "http-status";

import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { DoctorServices } from "./doctor.service";
import { ApplyAsDoctorValidationZodSchema } from "./doctor.validation";
import AppError from "../../errors/AppError";

const applyAsDoctor = catchAsync(async (req: Request, res: Response) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  console.log({ files });
  const resume = files?.["resume"] ? files["resume"][0] : null;
  const additionalFiles = files?.["additionalFiles"] || [];

  if (!req.body?.data) {
    throw new AppError(httpStatus.BAD_REQUEST, "Application data is required");
  }

  let parsedData: unknown;
  try {
    parsedData =
      typeof req.body.data === "string"
        ? JSON.parse(req.body.data)
        : req.body.data;
  } catch {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid JSON data in body");
  }

  const zodValidationResult =
    ApplyAsDoctorValidationZodSchema.safeParse(parsedData);

  if (!zodValidationResult.success) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      zodValidationResult.error.issues[0].message,
    );
  }

  const payload = zodValidationResult.data;

  const result = await DoctorServices.applyAsDoctor(
    payload,
    resume,
    additionalFiles,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Applied As Doctor Successfully",
    data: result,
  });
});
const verifyDoctorEmail = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;

  const result = await DoctorServices.verifyDoctorEmail(payload);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Doctor Email Verified Successfully",
    data: result,
  });
});
const approveDoctor = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const user = req.user!;

  const result = await DoctorServices.approveDoctor(payload, user);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Doctor Application Reviewed Successfully",
    data: result,
  });
});
const getAllDoctors = catchAsync(async (req: Request, res: Response) => {
  const { data, meta } = await DoctorServices.getAllDoctors(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Doctors Retrieved Successfully",
    data: data,
    meta: meta,
  });
});

export const DoctorController = {
  applyAsDoctor,
  verifyDoctorEmail,
  approveDoctor,
  getAllDoctors,
};
