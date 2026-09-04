import { NextFunction, Request, Response } from "express";
import { ZodTypeAny } from "zod";

export const validateRequest = (schema: ZodTypeAny) => {
	return async (req: Request, _res: Response, next: NextFunction) => {
		try {
			await schema.parseAsync({
				body: req.body,
				cookies: req.cookies,
				query: req.query,
				params: req.params,
			});
			next();
		} catch (error) {
			next(error);
		}
	};
};
