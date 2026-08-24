import dotenv from "dotenv";
import path from "path";

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
};
