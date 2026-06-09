/**
 * Authentication business logic.
 *
 * This service encapsulates all authentication operations: registration, login, token generation.
 * Controllers delegate to this service — they never interact with models directly.
 *
 * Why separate token generation into its own method?
 * - Reusable for token refresh scenarios
 * - Single place to modify token claims
 * - Testable in isolation
 */

import jwt from "jsonwebtoken";
import { User } from "../models";
import { env } from "../config/environment";
import { AppError } from "../utils/app-error";
import { IUser, JwtPayload } from "../types";

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthResult {
  user: IUser;
  tokens: AuthTokens;
}

function generateTokens(user: IUser): AuthTokens {
  const payload: JwtPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  };

  const accessToken = jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });

  const refreshToken = jwt.sign(payload, env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshExpiresIn,
  });

  return { accessToken, refreshToken };
}

export async function registerUser(
  email: string,
  password: string,
): Promise<AuthResult> {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw AppError.conflict("An account with this email already exists");
  }

  const user = await User.create({
    email,
    passwordHash: password,
  });

  const tokens = generateTokens(user);
  return { user, tokens };
}

export async function loginUser(
  email: string,
  password: string,
): Promise<AuthResult> {
  const user = await User.findOne({ email }).select("+passwordHash");
  if (!user) {
    throw AppError.unauthorized("Invalid email or password");
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw AppError.unauthorized("Invalid email or password");
  }

  const tokens = generateTokens(user);
  return { user, tokens };
}

export async function refreshAccessToken(
  refreshToken: string,
): Promise<AuthTokens> {
  try {
    const decoded = jwt.verify(
      refreshToken,
      env.jwtRefreshSecret,
    ) as JwtPayload;
    const user = await User.findById(decoded.userId);

    if (!user) {
      throw AppError.unauthorized("User no longer exists");
    }

    return generateTokens(user);
  } catch {
    throw AppError.unauthorized("Invalid or expired refresh token");
  }
}
