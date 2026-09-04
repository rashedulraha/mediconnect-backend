import { z } from "zod";

const registerPatientValidationSchema = z.object({
	body: z.object({
		name: z
			.string({
				message: "Name is required and must be a string",
			})
			.min(1, "Name cannot be empty")
			.trim(),
		email: z
			.string({
				message: "Email is required and must be a string",
			})
			.email("Please provide a valid email address")
			.trim()
			.toLowerCase(),
		password: z
			.string({
				message: "Password is required and must be a string",
			})
			.min(6, "Password must be at least 6 characters long"),
		contactNumber: z.string().optional(),
		address: z.string().optional(),
		patient: z
			.object({
				contactNumber: z.string().optional(),
				address: z.string().optional(),
			})
			.optional(),
	}),
});

const loginValidationSchema = z.object({
	body: z.object({
		email: z
			.string({
				message: "Email is required and must be a string",
			})
			.email("Please provide a valid email address")
			.trim()
			.toLowerCase(),
		password: z
			.string({
				message: "Password is required and must be a string",
			})
			.min(1, "Password is required"),
	}),
});

const changePasswordValidationSchema = z.object({
	body: z.object({
		currentPassword: z
			.string({
				message: "Current password is required",
			})
			.min(1, "Current password is required"),
		newPassword: z
			.string({
				message: "New password is required",
			})
			.min(6, "New password must be at least 6 characters long"),
	}),
});

const refreshTokenValidationSchema = z.object({
	cookies: z.object({
		refreshToken: z.string({
			message: "Refresh token is required",
		}),
	}),
});

export const AuthValidation = {
	registerPatientValidationSchema,
	loginValidationSchema,
	changePasswordValidationSchema,
	refreshTokenValidationSchema,
};
