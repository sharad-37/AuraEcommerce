/**
 * Custom application error class for consistent error handling.
 *
 * Why a custom error class?
 * - Distinguishes between operational errors (bad input, not found) and programmer errors (bugs)
 * - Carries HTTP status codes so the error middleware can respond appropriately
 * - Operational errors are safe to expose to clients; programmer errors are not
 *
 * This pattern is advocated by the Node.js best practices project
 * and is standard in Express applications of any scale.
 */

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errors?: Array<{ field: string; message: string }>;

  constructor(
    message: string,
    statusCode: number,
    errors?: Array<{ field: string; message: string }>,
    isOperational = true,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(
    message: string,
    errors?: Array<{ field: string; message: string }>,
  ): AppError {
    return new AppError(message, 400, errors);
  }

  static unauthorized(message = "Authentication required"): AppError {
    return new AppError(message, 401);
  }

  static forbidden(message = "Access denied"): AppError {
    return new AppError(message, 403);
  }

  static notFound(resource = "Resource"): AppError {
    return new AppError(`${resource} not found`, 404);
  }

  static conflict(message: string): AppError {
    return new AppError(message, 409);
  }

  static internal(message = "Internal server error"): AppError {
    return new AppError(message, 500, undefined, false);
  }
}
