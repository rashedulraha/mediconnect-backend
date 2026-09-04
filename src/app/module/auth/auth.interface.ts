import { Role } from "../../../generated/prisma/enums";

export interface IRegisterPatientPayload {
	name: string;
	email: string;
	password: string;
	contactNumber?: string;
	address?: string;
	patient?: {
		contactNumber?: string;
		address?: string;
	};
}

export interface ILoginUserPayload {
	email: string;
	password: string;
}

export interface IRequestUser {
	userId: string;
	email: string;
	name: string;
	role: Role;
}

export interface IChangePasswordPayload {
	currentPassword: string;
	newPassword: string;
}

export interface IForgotPassword {
	email: string;
}

export interface IResetPassword {
	email: string;
	newPassword: string;
	otp: string;
}
