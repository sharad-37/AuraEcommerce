/**
 * JWT authentication middleware.
 *
 * Extracts the Bearer token from the Authorization header, verifies it,
 * and attaches the decoded payload to req.user.
 *
 * Why Bearer scheme?
 * RFC 6750 defines Bearer as the standard scheme for OAuth 2.0 access tokens.
 * Even though we're using JWT directly (not full OAuth), following the convention
 * ensures compatibility with standard HTTP clients and API testing tools.
 */

import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/environment";
import { AppError } from "../utils/app-error";
import { AuthenticatedRequest, JwtPayload, UserRole } from "../types";

export function authenticate(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return next(AppError.unauthorized("No authentication token provided"));
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, env.jwtSecret) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
}

export function authorize(...roles: UserRole[]) {
  return (
    req: AuthenticatedRequest,
    _res: Response,
    next: NextFunction,
  ): void => {
    if (!req.user) {
      return next(AppError.unauthorized());
    }

    if (!roles.includes(req.user.role)) {
      return next(
        AppError.forbidden("You do not have permission to perform this action"),
      );
    }

    next();
  };
}
