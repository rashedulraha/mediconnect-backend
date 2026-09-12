import { createClient } from "redis";
import config from "../config";

export const redisClient = createClient({
	username: config.redis.user,
	password: config.redis.password,
	socket: {
		host: config.redis.host,
		port: Number(config.redis.port),
	},
});
