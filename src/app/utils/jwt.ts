import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";

const createToken = (
	payload: Record<string, unknown>,
	secret: string,
	expiresIn: string | number,
): string => {
	return jwt.sign(payload, secret, {
		expiresIn: expiresIn as SignOptions["expiresIn"],
	});
};

const verifyToken = (token: string, secret: string): JwtPayload => {
	return jwt.verify(token, secret) as JwtPayload;
};

export const jwtUtils = {
	createToken,
	verifyToken,
};
