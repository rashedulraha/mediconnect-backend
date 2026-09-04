import bcrypt from "bcryptjs";
import httpStatus from "http-status";
import { JwtPayload } from "jsonwebtoken";
import { Role, UserStatus } from "../../../generated/prisma/enums";
import config from "../../config";
import AppError from "../../errors/AppError";
import { prisma } from "../../lib/prisma";
import { jwtUtils } from "../../utils/jwt";
import crypto from "crypto";
import {
	IChangePasswordPayload,
	IForgotPassword,
	ILoginUserPayload,
	IRegisterPatientPayload,
	IRequestUser,
} from "./auth.interface";

import { redisClient } from "../../lib/redis";

const registerPatient = async (payload: IRegisterPatientPayload) => {
	const { name, password, contactNumber, address, patient } = payload;
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

	const patientContactNumber = patient?.contactNumber || contactNumber || null;
	const patientAddress = patient?.address || address || null;

	const createdUser = await prisma.user.create({
		data: {
			name,
			email,
			password: hashedPassword,
			role: Role.PATIENT,
			status: UserStatus.ACTIVE,
			emailVerified: false,
			patient: {
				create: {
					name,
					email,
					contactNumber: patientContactNumber,
					address: patientAddress,
				},
			},
		},
		include: {
			patient: true,
		},
	});

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
	const { email } = payload;
	const isUserExists = await prisma.user.findUnique({ where: { email } });

	if (!isUserExists) {
		throw new Error("User dose't exist . please try to current email");
	}

	if (isUserExists.status === "BLOCKED") {
		throw new Error("User is BLOCKED. please try to another  email");
	}

	if (isUserExists.isDeleted || isUserExists.status === "DELETED") {
		throw new Error("User is DELETED. please try to another  email");
	}

	const otp = crypto.randomInt(100000, 1000000).toString();
	const key = `forgot-password:${isUserExists.email}`;

	await redisClient.set(key, otp, {
		expiration: { type: "EX", value: 5 * 60 },
	});
};

// reset password
const resetPassword = async (payload: any) => {};

export const AuthService = {
	registerPatient,
	loginUser,
	getMe,
	refreshToken,
	changePassword,
	forgotPassword,
	resetPassword,
};
