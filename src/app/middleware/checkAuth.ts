import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { JwtPayload } from "jsonwebtoken";
import { Role, UserStatus } from "../../generated/prisma/enums";
import config from "../config";
import AppError from "../errors/AppError";
import { prisma } from "../lib/prisma";
import { catchAsync } from "../utils/catchAsync";
import { jwtUtils } from "../utils/jwt";

declare global {
	namespace Express {
		interface Request {
			user?: {
				userId: string;
				email: string;
				name: string;
				role: Role;
			};
		}
	}
}

export const auth = (...requiredRoles: Role[]) => {
	return catchAsync(
		async (req: Request, _res: Response, next: NextFunction) => {
			let token: string | undefined = req.cookies?.accessToken;

			if (!token && req.headers.authorization) {
				if (req.headers.authorization.startsWith("Bearer ")) {
					token = req.headers.authorization.split(" ")[1];
				} else {
					token = req.headers.authorization;
				}
			}

			if (!token) {
				throw new AppError(
					httpStatus.UNAUTHORIZED,
					"You are not authorized. Please log in to access this resource.",
				);
			}

			let verifiedToken: JwtPayload;
			try {
				verifiedToken = jwtUtils.verifyToken(token, config.jwt_access_secret);
			} catch {
				throw new AppError(
					httpStatus.UNAUTHORIZED,
					"Invalid or expired access token. Please log in again.",
				);
			}

			const { userId, role } = verifiedToken;

			if (!userId) {
				throw new AppError(httpStatus.UNAUTHORIZED, "Invalid token payload.");
			}

			const user = await prisma.user.findUnique({
				where: {
					id: userId,
				},
			});

			if (!user) {
				throw new AppError(
					httpStatus.NOT_FOUND,
					"User account not found. Please log in again.",
				);
			}

			if (user.isDeleted || user.status === UserStatus.DELETED) {
				throw new AppError(httpStatus.FORBIDDEN, "This account is deleted.");
			}

			if (user.status === UserStatus.BLOCKED) {
				throw new AppError(
					httpStatus.FORBIDDEN,
					"This account has been blocked. Please contact support.",
				);
			}

			if (requiredRoles.length && !requiredRoles.includes(user.role)) {
				throw new AppError(
					httpStatus.FORBIDDEN,
					"You do not have permission to access this resource.",
				);
			}

			req.user = {
				userId: user.id,
				email: user.email,
				name: user.name,
				role: user.role,
			};

			next();
		},
	);
};
