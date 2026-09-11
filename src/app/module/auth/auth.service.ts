import bcrypt from "bcryptjs";
import httpStatus from "http-status";
import type { JwtPayload } from "jsonwebtoken";
import { Role, UserStatus } from "../../../generated/prisma/enums";
import config from "../../config";
import AppError from "../../errors/AppError";
import { prisma } from "../../lib/prisma";
import { jwtUtils } from "../../utils/jwt";
import crypto from "node:crypto";
import type {
  IChangePasswordPayload,
  IForgotPassword,
  ILoginUserPayload,
  IRegisterPatientPayload,
  IRequestUser,
  IResetPassword,
  VerifyPatientEmailPayloadT,
} from "./auth.interface";

import { redisClient } from "../../lib/redis";
import { transporter } from "../../lib/nodeMailer";
import { changeSuccessfully } from "../../templete/changesuccessfully";
import { forgotPasswordT } from "../../templete/forgot-password";
import { emailVerificationT } from "../../templete/emailVerificationT";
import { welcomeEmailT } from "../../templete/welcomeEmailT";

const registerPatient = async (payload: IRegisterPatientPayload) => {
  const { name, password } = payload;
  const email = payload.email.trim().toLowerCase();

  const isUserExists = await prisma.user.findUnique({
    where: { email },
  });

  if (isUserExists) {
    throw new AppError(
      httpStatus.CONFLICT,
      "User with this email already exists.",
    );
  }

  const hashedPassword = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_rounds) || 10,
  );

  const otpValue = crypto.randomInt(100000, 1000000).toString();
  const otpKey = `patient-registration-otp:${email}`;

  await redisClient.set(otpKey, otpValue, {
    expiration: { type: "EX", value: 5 * 60 },
  });

  const patientRegistrationKey = `patient-registration-data:${email}`;
  const redisUserDataPayload = {
    name,
    email,
    password: hashedPassword,
    patient: {
      contactNumber: payload.patient?.contactNumber ?? payload.contactNumber,
      address: payload.patient?.address ?? payload.address,
    },
  };

  await redisClient.set(
    patientRegistrationKey,
    JSON.stringify(redisUserDataPayload),
    {
      expiration: { type: "EX", value: 5 * 60 },
    },
  );

  await transporter.sendMail({
    from: config.email_sender,
    to: email,
    subject: "Forgot Password - OTP Verification",
    // text: `Your OTP is ${otp} `,
    html: emailVerificationT(otpValue),
  });
};
// verify patient email
const verifyPatientEmail = async (payload: VerifyPatientEmailPayloadT) => {
  const otp = payload.otp.trim();
  const email = payload.email.trim().toLowerCase();
  const isUserExists = await prisma.user.findUnique({
    where: { email },
  });

  if (isUserExists?.status === UserStatus.BLOCKED) {
    throw new Error("User is BLOCKED. please try to another  email");
  }

  if (isUserExists?.isDeleted || isUserExists?.status === UserStatus.DELETED) {
    throw new Error("User is DELETED. please try to another  email");
  }

  if (isUserExists) {
    throw new AppError(
      httpStatus.CONFLICT,
      "User with this email already exists.",
    );
  }

  // match redis otp
  // const key = `forgot-password:${isUserExists.email}`;
  const otpKey = `patient-registration-otp:${email}`;
  const redisOtp = await redisClient.get(otpKey);

  if (!redisOtp) {
    throw new Error("Invalid OTP");
  }

  if (redisOtp !== otp) {
    throw new Error("OTP Dose't match");
  }

  await redisClient.del(otpKey);

  const patientRegistrationKey = `patient-registration-data:${email}`;

  const patientRedisData = await redisClient.get(patientRegistrationKey);

  if (!patientRedisData) {
    throw new Error("User dose't exist");
  }

  const patientRedisDataParse: IRegisterPatientPayload =
    JSON.parse(patientRedisData);

  const createdUser = await prisma.user.create({
    data: {
      name: patientRedisDataParse.name,
      email: patientRedisDataParse.email,
      password: patientRedisDataParse.password,
      imageUrl: "",
      imagePublicId: "",
      role: Role.PATIENT,
      status: UserStatus.ACTIVE,
      emailVerified: true,
      patient: {
        create: {
          name: patientRedisDataParse.name,
          email: patientRedisDataParse.email,
          contactNumber:
            patientRedisDataParse.patient?.contactNumber ??
            patientRedisDataParse.contactNumber,
          address:
            patientRedisDataParse.patient?.address ??
            patientRedisDataParse.address,
        },
      },
    },
    include: {
      patient: true,
    },
  });

  await redisClient.del(patientRegistrationKey);

  // Omit password from returned object
  const { password: _, ...userWithoutPassword } = createdUser;

  const jwtPayload = {
    userId: createdUser.id,
    name: createdUser.name,
    email: createdUser.email,
    role: createdUser.role,
  };

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expires_in,
  );

  const refreshToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_refresh_secret,
    config.jwt_refresh_expires_in,
  );

  // send welcome email
  await transporter.sendMail({
    from: config.email_sender,
    to: email,
    subject: "Welcome to our platform",
    // text: `Your OTP is ${otp} `,
    html: welcomeEmailT("Medi connect"),
  });

  return {
    user: userWithoutPassword,
    patient: createdUser.patient,
    accessToken,
    refreshToken,
  };
};

const loginUser = async (payload: ILoginUserPayload) => {
  const { password } = payload;
  const email = payload.email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      patient: true,
    },
  });

  if (!user) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid email or password.");
  }

  if (user.isDeleted || user.status === UserStatus.DELETED) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "This user account has been deleted.",
    );
  }

  if (user.status === UserStatus.BLOCKED) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "This user account has been blocked. Please contact support.",
    );
  }

  const isPasswordMatched = await bcrypt.compare(password, user.password);

  if (!isPasswordMatched) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid email or password.");
  }

  const jwtPayload = {
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expires_in,
  );

  const refreshToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_refresh_secret,
    config.jwt_refresh_expires_in,
  );

  const { password: _, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    accessToken,
    refreshToken,
  };
};

const getMe = async (requestUser: IRequestUser) => {
  const user = await prisma.user.findUnique({
    where: {
      id: requestUser.userId,
    },
    include: {
      patient: true,
    },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User profile not found.");
  }

  if (user.isDeleted || user.status === UserStatus.DELETED) {
    throw new AppError(httpStatus.FORBIDDEN, "User account is deleted.");
  }

  if (user.status === UserStatus.BLOCKED) {
    throw new AppError(httpStatus.FORBIDDEN, "User account is blocked.");
  }

  const { password: _, ...userWithoutPassword } = user;

  return userWithoutPassword;
};

const refreshToken = async (token: string) => {
  let decoded: JwtPayload;

  try {
    decoded = jwtUtils.verifyToken(token, config.jwt_refresh_secret);
  } catch {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "Invalid or expired refresh token. Please log in again.",
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
  });

  if (!user || user.isDeleted || user.status !== UserStatus.ACTIVE) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "User is inactive or no longer exists.",
    );
  }

  const jwtPayload = {
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expires_in,
  );

  const newRefreshToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_refresh_secret,
    config.jwt_refresh_expires_in,
  );

  return {
    accessToken,
    refreshToken: newRefreshToken,
  };
};

const changePassword = async (
  requestUser: IRequestUser,
  payload: IChangePasswordPayload,
) => {
  const { currentPassword, newPassword } = payload;

  const user = await prisma.user.findUnique({
    where: { id: requestUser.userId },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found.");
  }

  const isPasswordMatched = await bcrypt.compare(
    currentPassword,
    user.password,
  );

  if (!isPasswordMatched) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Current password does not match.",
    );
  }

  const hashedPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_rounds) || 10,
  );

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      needPasswordChange: false,
    },
  });

  return {
    message: "Password changed successfully.",
  };
};

// forgot password
const forgotPassword = async (payload: IForgotPassword) => {
  const email = payload.email.trim().toLowerCase();
  const isUserExists = await prisma.user.findUnique({ where: { email } });

  if (!isUserExists) {
    throw new Error("User dose't exist . please try to current email");
  }

  if (isUserExists.status === UserStatus.BLOCKED) {
    throw new Error("User is BLOCKED. please try to another  email");
  }

  if (isUserExists.isDeleted || isUserExists.status === UserStatus.DELETED) {
    throw new Error("User is DELETED. please try to another  email");
  }

  const otp = crypto.randomInt(100000, 1000000).toString();
  const key = `forgot-password:${isUserExists.email}`;

  await redisClient.set(key, otp, {
    expiration: { type: "EX", value: 5 * 60 },
  });

  await transporter.sendMail({
    from: config.email_sender,
    to: isUserExists.email,
    subject: "Forgot Password - OTP Verification",
    // text: `Your OTP is ${otp} `,
    html: forgotPasswordT(otp),
  });
};

// reset password
const resetPassword = async (payload: IResetPassword) => {
  const { otp, newPassword } = payload;
  const email = payload.email.trim().toLowerCase();

  const isUserExists = await prisma.user.findUnique({ where: { email } });

  if (!isUserExists) {
    throw new Error("User dose't exist . please try to current email");
  }

  if (isUserExists.status === UserStatus.BLOCKED) {
    throw new Error("User is BLOCKED. please try to another  email");
  }

  if (isUserExists.isDeleted || isUserExists.status === UserStatus.DELETED) {
    throw new Error("User is DELETED. please try to another  email");
  }

  // match redis otp
  const key = `forgot-password:${isUserExists.email}`;
  const redisOtp = await redisClient.get(key);

  if (!redisOtp) {
    throw new Error("Invalid OTP");
  }

  if (redisOtp !== otp) {
    throw new Error("OTP Dose't match");
  }

  const hashedPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_rounds) || 10,
  );

  // update user
  await prisma.user.update({
    where: {
      email: isUserExists.email,
    },
    data: {
      password: hashedPassword,
    },
  });

  await redisClient.del(key);
  await transporter.sendMail({
    from: config.email_sender,
    to: isUserExists.email,
    subject: "You password changed successfully. try login",
    // text: `Your OTP is ${otp} `,
    html: changeSuccessfully(isUserExists.name),
  });
};

export const AuthService = {
  registerPatient,
  loginUser,
  getMe,
  refreshToken,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyPatientEmail,
};
