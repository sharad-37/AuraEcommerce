/**
 * Auth controller — HTTP layer for authentication endpoints.
 *
 * Controllers are thin. They:
 * 1. Extract data from the request
 * 2. Call the appropriate service method
 * 3. Format and send the response
 *
 * No business logic lives here. This separation makes services testable
 * without HTTP concerns and makes controllers replaceable (e.g., if we
 * later add GraphQL, services remain unchanged).
 */

import { Request, Response } from "express";
import * as authService from "../services/auth.service";
import { asyncHandler } from "../utils/async-handler";
import { ApiResponse } from "../types";

export const register = asyncHandler(
  async (req: Request, res: Response<ApiResponse>) => {
    const { email, password } = req.body;
    const result = await authService.registerUser(email, password);

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: {
        user: result.user.toJSON(),
        tokens: result.tokens,
      },
    });
  },
);

export const login = asyncHandler(
  async (req: Request, res: Response<ApiResponse>) => {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: result.user.toJSON(),
        tokens: result.tokens,
      },
    });
  },
);

export const refresh = asyncHandler(
  async (req: Request, res: Response<ApiResponse>) => {
    const { refreshToken } = req.body;
    const tokens = await authService.refreshAccessToken(refreshToken);

    res.status(200).json({
      success: true,
      data: { tokens },
    });
  },
);
