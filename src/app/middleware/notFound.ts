import { Request, Response } from "express";
import httpStatus from "http-status";

export const notFound = (req: Request, res: Response) => {
	res.status(httpStatus.NOT_FOUND).json({
		success: false,
		statusCode: httpStatus.NOT_FOUND,
		message: "API Route Not Found",
		error: {
			path: req.originalUrl,
			message: "Your requested path is not found on this server.",
		},
	});
};
