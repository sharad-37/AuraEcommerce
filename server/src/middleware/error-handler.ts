/**
 * Centralized error handling middleware.
 *
 * This is the single point where all errors are formatted and sent to clients.
 * It distinguishes between:
 * - Operational errors (AppError): Safe to expose message to client
 * - Mongoose validation errors: Converted to structured field-level errors
 * - Mongoose duplicate key errors: Converted to conflict responses
 * - Unknown errors: Generic 500 response (details logged, not exposed)
 */

import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { AppError } from "../utils/app-error";
import { ApiResponse } from "../types";
import { isProduction } from "../config/environment";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response<ApiResponse>,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
    return;
  }

  if (err instanceof mongoose.Error.ValidationError) {
    const errors = Object.entries(err.errors).map(([field, error]) => ({
      field,
      message: error.message,
    }));

    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
    return;
  }

  if (
    err.name === "MongoServerError" &&
    (err as Record<string, unknown>).code === 11000
  ) {
    const keyPattern = (err as Record<string, unknown>).keyPattern as Record<
      string,
      unknown
    >;
    const duplicateField = Object.keys(keyPattern)[0];

    res.status(409).json({
      success: false,
      message: `A record with this ${duplicateField} already exists`,
    });
    return;
  }

  if (err.name === "JsonWebTokenError") {
    res.status(401).json({
      success: false,
      message: "Invalid authentication token",
    });
    return;
  }

  if (err.name === "TokenExpiredError") {
    res.status(401).json({
      success: false,
      message: "Authentication token has expired",
    });
    return;
  }

  console.error("[Error]", err);

  res.status(500).json({
    success: false,
    message: isProduction ? "Internal server error" : err.message,
  });
}
