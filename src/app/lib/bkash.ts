import config from "../config";
import { redisClient } from "./redis";

export const getBkashIdToken = async () => {
  try {
    const IdTokenKey = "bkash:idTOken";
    const refreshToken = "bkash:refreshToken";

    // get redis id token
    let bkashIdTOken = await redisClient.get(IdTokenKey);
    const bkashIdTokenTTL = await redisClient.ttl(IdTokenKey);
    let bkashRefrshTOken = await redisClient.get(refreshToken);

    const bkashRefreshTOkenTTL = await redisClient.ttl(refreshToken);

    if (
      (bkashIdTokenTTL <= 600 || !bkashIdTOken) &&
      bkashRefrshTOken &&
      bkashRefreshTOkenTTL > 600
    ) {
      const refreshTokenResponse = await fetch(
        `${config.BKASH_SANDBOX_BASE_URL}/tokenized/checkout/token/refresh`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            username: config.BKASH_USERNAME,
            password: config.BKASH_PASSWORD,
          },
          body: JSON.stringify({
            app_key: config.BKASH_APP_KEY,
            app_secret: config.BKASH_APP_SECRET,
            refresh_token: bkashRefrshTOken,
          }),
        },
      );

      const bkashRefreshTokenRefresh = await refreshTokenResponse.json();

      bkashIdTOken = bkashRefreshTokenRefresh.id_token as string;
      await redisClient.set(IdTokenKey, bkashIdTOken, {
        expiration: {
          type: "EX",
          value: 60 * 60,
        },
      });
      return bkashIdTOken;
    }

    if (bkashIdTokenTTL > 600) {
      return bkashIdTOken;
    }

    const response = await fetch(
      `${config.BKASH_SANDBOX_BASE_URL}/tokenized/checkout/token/grant`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          username: config.BKASH_USERNAME,
          password: config.BKASH_PASSWORD,
        },
        body: JSON.stringify({
          app_key: config.BKASH_APP_KEY,
          app_secret: config.BKASH_APP_SECRET,
        }),
      },
    );

    if (!response.ok) {
      throw new Error("Bkash access token Grant failed");
    }
    const result = await response.json();

    // bkash  id token set
    await redisClient.set(IdTokenKey, result.id_token, {
      expiration: {
        type: "EX",
        value: 60 * 60, // 1h
      },
    });

    // bkash refresh token set
    await redisClient.set(refreshToken, result.refresh_token, {
      expiration: {
        type: "EX",
        value: 60 * 60 * 24 * 28, // 28 day
      },
    });

    bkashIdTOken = result.id_token;
    return bkashIdTOken;
  } catch (error) {
    const e = error as Error;
    throw new Error(e.message);
  }
};
