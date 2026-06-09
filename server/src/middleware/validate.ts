/**
 * Express-validator integration middleware.
 *
 * Runs validation chains and formats errors consistently.
 * This decouples validation rules (defined in validators/) from error formatting.
 */

import { Request, Response, NextFunction } from "express";
import { validationResult, ValidationChain } from "express-validator";
import { ApiResponse } from "../types";

export function validate(validations: ValidationChain[]) {
  return async (
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction,
  ): Promise<void> => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);

    if (errors.isEmpty()) {
      return next();
    }

    const formattedErrors = errors.array().map((err) => ({
      field: "path" in err ? (err.path as string) : "unknown",
      message: err.msg as string,
    }));

    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: formattedErrors,
    });
  };
}
