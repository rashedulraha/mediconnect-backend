import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import httpStatus from "http-status";
import config from "./app/config";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import { notFound } from "./app/middleware/notFound";
import { AuthRoutes } from "./app/module/auth/auth.route";
import { redisClient } from "./app/lib/redis";
import crypto from "crypto";
const app: Application = express();

app.use(
  cors({
    origin: [
      config.frontend_url,
      "http://localhost:3000",
      "http://localhost:5173",
    ].filter(Boolean) as string[],
    credentials: true,
  }),
);

// Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser());

// Application API routes
app.use("/api/v1", AuthRoutes);

// test route
app.get("/test", async (req: Request, res: Response) => {
  try {
    const otp = crypto.randomInt(100000, 1000000);
    // create redis otp with client
    // await redisClient.set("patient@gmail.com", "124578", {
    //   expiration: {
    //     type: "EX",
    //     value: 60,
    //   },
    // });

    res.status(httpStatus.OK).json({
      message: "test route is working",
      data: otp,
      statusCode: httpStatus.OK,
    });
  } catch (error) {
    console.log("test  request failed");
  }
});

// Root health check route
app.get("/", (_req: Request, res: Response) => {
  res.status(httpStatus.OK).json({
    success: true,
    statusCode: httpStatus.OK,
    message: "Welcome to MediConnect Healthcare System API",
  });
});

// Error handling middlewares
app.use(globalErrorHandler);
app.use(notFound);

export default app;
