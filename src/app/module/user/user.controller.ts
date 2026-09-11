import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { userService } from "./user.service";

const uploadProfileImg = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  if (!req.file) {
    throw new Error("No File Provided");
  }

  if (!userId) {
    throw new Error("user  not found");
  }

  const result = await userService.uploadProfileImg(req.file?.buffer, userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "profile upload successfully",
    data: result,
  });
});

export const userController = {
  uploadProfileImg,
};
