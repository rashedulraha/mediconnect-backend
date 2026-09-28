import { z } from "zod";

// ===============================
// Register Patient Validation
// ===============================
const registerPatientValidationSchema = z.object({
  body: z.object({
    name: z
      .string({
        message: "Name is required and must be a string",
      })
      .trim()
      .min(1, "Name cannot be empty"),

    email: z
      .string({
        message: "Email is required and must be a string",
      })
      .trim()
      .email("Please provide a valid email address")
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

// ===============================
// Login Validation
// ===============================
const loginValidationSchema = z.object({
  body: z.object({
    email: z
      .string({
        message: "Email is required and must be a string",
      })
      .trim()
      .email("Please provide a valid email address")
      .toLowerCase(),

    password: z
      .string({
        message: "Password is required and must be a string",
      })
      .min(1, "Password is required"),
  }),
});

// ===============================
// Change Password Validation
// ===============================
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

// ===============================
// Forgot Password Validation
// ===============================
const forgotPasswordValidationSchema = z.object({
  body: z.object({
    email: z
      .string({
        message: "Email is required and must be a string",
      })
      .trim()
      .email("Please provide a valid email address")
      .toLowerCase(),
  }),
});

// ===============================
// Reset Password Validation
// ===============================
const resetPasswordValidationSchema = z.object({
  body: z.object({
    email: z
      .string({
        message: "Email is required and must be a string",
      })
      .trim()
      .email("Please provide a valid email address")
      .toLowerCase(),

    newPassword: z
      .string({
        message: "New password is required",
      })
      .min(6, "New password must be at least 6 characters long"),

    otp: z
      .string({
        message: "OTP is required",
      })
      .length(6, "OTP must be exactly 6 characters long"),
  }),
});

// ===============================
// Refresh Token Validation
// ===============================
const refreshTokenValidationSchema = z.object({
  cookies: z.object({
    refreshToken: z
      .string({
        message: "Refresh token is required",
      })
      .min(1, "Refresh token is required"),
  }),
});

// ===============================
// Export Validation Schemas
// ===============================
export const AuthValidation = {
  registerPatientValidationSchema,
  loginValidationSchema,
  changePasswordValidationSchema,
  refreshTokenValidationSchema,
  resetPasswordValidationSchema,
  forgotPasswordValidationSchema,
};
