import { ErrorRequestHandler } from "express";
import httpStatus from "http-status";
import { ZodError } from "zod";
import { Prisma } from "../../generated/prisma/client";
import config from "../config";
import AppError from "../errors/AppError";

type TErrorSources = {
	path: string | number;
	message: string;
}[];

export const globalErrorHandler: ErrorRequestHandler = (
	err,
	_req,
	res,
	_next,
) => {
	if (config.node_env === "development") {
		console.error("Global Error Handler:", err);
	}

	let statusCode: number = httpStatus.INTERNAL_SERVER_ERROR;
	let message = "Internal Server Error";
	let errorSources: TErrorSources = [];

	// Handle custom AppError
	if (err instanceof AppError) {
		statusCode = err.statusCode;
		message = err.message;
		errorSources = [
			{
				path: "",
				message: err.message,
			},
		];
	}
	// Handle Zod Validation Error
	else if (err instanceof ZodError) {
		statusCode = httpStatus.BAD_REQUEST;
		message = "Validation Error";
		errorSources = err.issues.map((issue) => {
			return {
				path: issue.path.map(String).join(".") || "",
				message: issue.message,
			};
		});
	}
	// Handle Prisma Known Request Errors
	else if (err instanceof Prisma.PrismaClientKnownRequestError) {
		if (err.code === "P2002") {
			statusCode = httpStatus.CONFLICT;
			const target = Array.isArray(err.meta?.target)
				? err.meta.target.join(", ")
				: (err.meta?.target as string) || "Field";
			message = `${target} already exists.`;
			errorSources = [
				{
					path: target,
					message,
				},
			];
		} else if (err.code === "P2025") {
			statusCode = httpStatus.NOT_FOUND;
			message =
				(err.meta?.cause as string) ||
				"Record not found or operation failed on missing record.";
			errorSources = [
				{
					path: "",
					message,
				},
			];
		} else if (err.code === "P2003") {
			statusCode = httpStatus.BAD_REQUEST;
			message = "Foreign key constraint failed.";
			errorSources = [
				{
					path: "",
					message,
				},
			];
		} else {
			statusCode = httpStatus.BAD_REQUEST;
			message = err.message || "Database error occurred.";
			errorSources = [
				{
					path: "",
					message,
				},
			];
		}
	}
	// Handle Prisma Validation Error
	else if (err instanceof Prisma.PrismaClientValidationError) {
		statusCode = httpStatus.BAD_REQUEST;
		message = "You have provided incorrect field type or missing fields.";
		errorSources = [
			{
				path: "",
				message,
			},
		];
	}
	// Handle Prisma Initialization Error
	else if (err instanceof Prisma.PrismaClientInitializationError) {
		statusCode = httpStatus.SERVICE_UNAVAILABLE;
		message = "Database connection failed. Please check database server.";
		errorSources = [
			{
				path: "",
				message,
			},
		];
	}
	// Handle JWT Error
	else if (err.name === "JsonWebTokenError") {
		statusCode = httpStatus.UNAUTHORIZED;
		message = "Invalid token. Please authenticate again.";
		errorSources = [
			{
				path: "",
				message,
			},
		];
	} else if (err.name === "TokenExpiredError") {
		statusCode = httpStatus.UNAUTHORIZED;
		message = "Token has expired. Please log in again.";
		errorSources = [
			{
				path: "",
				message,
			},
		];
	}
	// Handle standard Error
	else if (err instanceof Error) {
		message = err.message;
		errorSources = [
			{
				path: "",
				message,
			},
		];
	}

	res.status(statusCode).json({
		success: false,
		statusCode,
		message,
		errorSources: errorSources.length > 0 ? errorSources : undefined,
		error: config.node_env === "development" ? err : undefined,
		stack: config.node_env === "development" ? err.stack : undefined,
	});
};
