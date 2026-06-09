/**
 * Wraps async route handlers to automatically catch rejected promises.
 *
 * Without this wrapper, every async controller would need try/catch blocks.
 * This utility eliminates that repetition while ensuring all async errors
 * reach the centralized error handling middleware.
 */

import { Request, Response, NextFunction } from "express";

type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<void>;

export function asyncHandler(fn: AsyncHandler) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
