import { z } from "zod";
export const envSchems = z.object({
    NODE_ENV: z.enum(["development", "production"]).default("development"),
    PORT: z.string().default("5000"),
    DATABASE_URL: z.string({ message: "DATABASE_URL is required" }),
    BACKEND_URL: z.string().default("http://localhost:5000"),
    FRONTEND_URL: z.string().default("http://localhost:3000"),
    BCRYPT_SALT_ROUNDS: z.string().default("10"),

    JWT_ACCESS_SECRET: z.string({ message: "JWT_ACCESS_SECRET is required" }),
    JWT_REFRESH_SECRET: z.string({ message: "JWT_REFRESH_SECRET is required" }),
    JWT_ACCESS_EXPIRES_IN: z.string().default("1d"),
    JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),

    SUPER_ADMIN_NAME: z.string().optional(),
    SUPER_ADMIN_EMAIL: z.string().optional(),
    SUPER_ADMIN_PASSWORD: z.string().optional(),

    TESTER_ADMIN_NAME: z.string().optional(),
    TESTER_ADMIN_EMAIL: z.string().optional(),
    TESTER_ADMIN_PASSWORD: z.string().optional(),

    TESTER_DOCTOR_NAME: z.string().optional(),
    TESTER_DOCTOR_EMAIL: z.string().optional(),
    TESTER_DOCTOR_PASSWORD: z.string().optional(),

    // REDIS
    REDIS_USER: z.string().optional(),
    REDIS_PASSWORD: z.string().optional(),
    REDIS_HOST: z.string().optional(),
    REDIS_PORT: z.string().optional(),

    // SMTP
    SMTP_USER: z.string().optional(),
    SMTP_PASSWORD: z.string().optional(),
    EMAIL_SENDER: z.string().optional(),

    // CLOUDINARY
    CLOUDINARY_CLOUD_NAME: z.string().optional(),
    CLOUDINARY_API_KEY: z.string().optional(),
    CLOUDINARY_API_SECRET: z.string().optional(),

    // BKASH
    BKASH_SANDBOX_BASE_URL: z.string().optional(),
    BKASH_USERNAME: z.string().optional(),
    BKASH_PASSWORD: z.string().optional(),
    BKASH_APP_KEY: z.string().optional(),
    BKASH_APP_SECRET: z.string().optional(),
    BKASH_CALLBACK_URL: z.string().optional(),
});
