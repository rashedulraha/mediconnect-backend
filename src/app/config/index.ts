import dotenv from "dotenv";
import path from "path";
import { envSchems } from "./index.validation";


dotenv.config({ path: path.join(process.cwd(), ".env") });



const validationResult = envSchems.safeParse(process.env);

if (!validationResult.success) {
  console.error("❌ Environment variable validation error:", validationResult.error.format());
  process.exit(1);
}

const env = validationResult.data;

export default {
  nodeEnv: env.NODE_ENV,
  port: Number(env.PORT),
  databaseUrl: env.DATABASE_URL,
  backendUrl: env.BACKEND_URL,
  frontendUrl: env.FRONTEND_URL,
  bcryptSaltRounds: Number(env.BCRYPT_SALT_ROUNDS),

  jwt: {
    accessSecret: env.JWT_ACCESS_SECRET,
    refreshSecret: env.JWT_REFRESH_SECRET,
    accessExpiresIn: env.JWT_ACCESS_EXPIRES_IN,
    refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
  },

  superAdmin: {
    name: env.SUPER_ADMIN_NAME,
    email: env.SUPER_ADMIN_EMAIL,
    password: env.SUPER_ADMIN_PASSWORD,
  },

  testerAdmin: {
    name: env.TESTER_ADMIN_NAME,
    email: env.TESTER_ADMIN_EMAIL,
    password: env.TESTER_ADMIN_PASSWORD,
  },

  testerDoctor: {
    name: env.TESTER_DOCTOR_NAME,
    email: env.TESTER_DOCTOR_EMAIL,
    password: env.TESTER_DOCTOR_PASSWORD,
  },

  redis: {
    user: env.REDIS_USER,
    password: env.REDIS_PASSWORD,
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
  },

  smtp: {
    user: env.SMTP_USER,
    password: env.SMTP_PASSWORD,
    emailSender: env.EMAIL_SENDER,
  },

  cloudinary: {
    cloudName: env.CLOUDINARY_CLOUD_NAME,
    apiKey: env.CLOUDINARY_API_KEY,
    apiSecret: env.CLOUDINARY_API_SECRET,
  },

  bkash: {
    sandboxBaseUrl: env.BKASH_SANDBOX_BASE_URL,
    username: env.BKASH_USERNAME,
    password: env.BKASH_PASSWORD,
    appKey: env.BKASH_APP_KEY,
    appSecret: env.BKASH_APP_SECRET,
    callbackUrl: env.BKASH_CALLBACK_URL,
  },
};