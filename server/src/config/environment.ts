/**
 * Centralized environment configuration with validation.
 *
 * This module loads environment variables and validates their presence at startup.
 * If any required variable is missing, the application fails immediately rather than
 * encountering cryptic runtime errors later. This follows the "fail fast" principle.
 *
 * Why a dedicated config module instead of accessing process.env directly?
 * - Single source of truth for all configuration
 * - TypeScript types for config values
 * - Validation happens once at startup
 * - Easy to mock in tests
 */

import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

interface EnvironmentConfig {
  nodeEnv: string;
  port: number;
  mongodbUri: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  jwtRefreshSecret: string;
  jwtRefreshExpiresIn: string;
  corsOrigin: string;
  rateLimitWindowMs: number;
  rateLimitMax: number;
}

function getEnvVariable(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function getEnvNumber(key: string, fallback?: number): number {
  const raw = process.env[key];
  if (raw === undefined && fallback === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  const parsed = Number(raw ?? fallback);
  if (isNaN(parsed)) {
    throw new Error(
      `Environment variable ${key} must be a valid number. Received: ${raw}`,
    );
  }
  return parsed;
}

export const env: EnvironmentConfig = {
  nodeEnv: getEnvVariable("NODE_ENV", "development"),
  port: getEnvNumber("PORT", 3000),
  mongodbUri: getEnvVariable("MONGODB_URI"),
  jwtSecret: getEnvVariable("JWT_SECRET"),
  jwtExpiresIn: getEnvVariable("JWT_EXPIRES_IN", "15m"),
  jwtRefreshSecret: getEnvVariable("JWT_REFRESH_SECRET"),
  jwtRefreshExpiresIn: getEnvVariable("JWT_REFRESH_EXPIRES_IN", "7d"),
  corsOrigin: getEnvVariable("CORS_ORIGIN", "http://localhost:4200"),
  rateLimitWindowMs: getEnvNumber("RATE_LIMIT_WINDOW_MS", 900000),
  rateLimitMax: getEnvNumber("RATE_LIMIT_MAX", 100),
};

export const isProduction = env.nodeEnv === "production";
export const isDevelopment = env.nodeEnv === "development";
