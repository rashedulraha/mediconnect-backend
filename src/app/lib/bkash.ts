import config from "../config";
import { redisClient } from "./redis";

export const getBkashIdToken = async () => {
  try {
    const idTokenKey = "bkash:idToken";
    const refreshTokenKey = "bkash:refreshToken";

    // Get tokens and TTL from Redis
    let bkashIdToken = await redisClient.get(idTokenKey);
    const bkashIdTokenTTL = await redisClient.ttl(idTokenKey);
    let bkashRefreshToken = await redisClient.get(refreshTokenKey);
    const bkashRefreshTokenTTL = await redisClient.ttl(refreshTokenKey);

    // 1. Refresh Token Flow (if ID token is about to expire)
    if (
      (bkashIdTokenTTL <= 600 || !bkashIdToken) &&
      bkashRefreshToken &&
      bkashRefreshTokenTTL > 600
    ) {
      const refreshTokenResponse = await fetch(
        `${config.bkash.sandboxBaseUrl}/tokenized/checkout/token/refresh`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            username: config.bkash.username as string,
            password: config.bkash.password as string,
          },
          body: JSON.stringify({
            app_key: config.bkash.appKey,
            app_secret: config.bkash.appSecret,
            refresh_token: bkashRefreshToken,
          }),
        },
      );

      const refreshTokenResult = await refreshTokenResponse.json();

      bkashIdToken = refreshTokenResult.id_token as string;
      await redisClient.set(idTokenKey, bkashIdToken, {
        expiration: { type: "EX", value: 3600 }, // 1 hour
      });

      return bkashIdToken;
    }

    // 2. Return existing valid ID token
    if (bkashIdTokenTTL > 600 && bkashIdToken) {
      return bkashIdToken;
    }

    // 3. Grant New Token Flow (if no valid tokens exist)
    const response = await fetch(
      `${config.bkash.sandboxBaseUrl}/tokenized/checkout/token/grant`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          username: config.bkash.username as string,
          password: config.bkash.password as string,
        },
        body: JSON.stringify({
          app_key: config.bkash.appKey,
          app_secret: config.bkash.appSecret,
        }),
      },
    );

    if (!response.ok) {
      throw new Error("Bkash access token Grant failed");
    }

    const result = await response.json();

    // Save ID Token (1 Hour)
    await redisClient.set(idTokenKey, result.id_token, {
      expiration: { type: "EX", value: 3600 },
    });

    // Save Refresh Token (28 Days)
    await redisClient.set(refreshTokenKey, result.refresh_token, {
      expiration: { type: "EX", value: 60 * 60 * 24 * 28 },
    });

    return result.id_token as string;
  } catch (error) {
    const e = error as Error;
    throw new Error(e.message);
  }
};