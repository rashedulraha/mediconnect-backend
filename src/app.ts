import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import config from "./app/config";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import { notFound } from "./app/middleware/notFound";
import { AuthRoutes } from "./app/module/auth/auth.route";
import { redisClient } from "./app/lib/redis";
import crypto from "crypto";
import { userRoute } from "./app/module/user/user.route";
import { getBkashIdToken } from "./app/lib/bkash";
import { appointmentRoutes } from "./app/module/appoientment/appointment.route";

const app: Application = express();

app.use(
  cors({
    origin: [
      config.frontendUrl,
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
app.use("/api/v1/auth", AuthRoutes);

// user routes
app.use("/api/v1/user", userRoute);

// appointment
app.use("/api/v1/appointment", appointmentRoutes);

// test route
app.get("/test", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await getBkashIdToken();
    console.log(result);

    res.status(httpStatus.OK).json({
      message: "test route is working",
      data: result,
      statusCode: httpStatus.OK,
    });
  } catch (error) {
    const e = error as Error;
    console.log(e);
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
