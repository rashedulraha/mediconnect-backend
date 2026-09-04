import dotenv from "dotenv";
import path from "path";
import { RedisClient } from "redis";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
  node_env: process.env.NODE_ENV || "development",
  port: process.env.PORT || 5000,
  database_url: process.env.DATABASE_URL,
  backend_url: process.env.BACKEND_URL || "http://localhost:5000",
  frontend_url: process.env.FRONTEND_URL || "http://localhost:3000",
  bcrypt_salt_rounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 10,
  jwt_access_secret: process.env.JWT_ACCESS_SECRET || "default_access_secret",
  jwt_refresh_secret:
    process.env.JWT_REFRESH_SECRET || "default_refresh_secret",
  jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN || "1d",
  jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  super_admin_name: process.env.SUPER_ADMIN_NAME,
  super_admin_email: process.env.SUPER_ADMIN_EMAIL,
  super_admin_password: process.env.SUPER_ADMIN_PASSWORD,

  tester_admin_name: process.env.TESTER_ADMIN_NAME,
  tester_admin_email: process.env.TESTER_ADMIN_EMAIL,
  tester_admin_password: process.env.TESTER_ADMIN_PASSWORD,

  tester_doctor_name: process.env.TESTER_DOCTOR_NAME,
  tester_doctor_email: process.env.TESTER_DOCTOR_EMAIL,
  tester_doctor_password: process.env.TESTER_DOCTOR_PASSWORD,
  // REDIS CONFIGURATION
  redis_user: process.env.REDIS_USER,
  redis_password: process.env.REDIS_PASSWORD,
  redis_host: process.env.REDIS_HOST,
  redis_port: process.env.REDIS_PORT,
};
