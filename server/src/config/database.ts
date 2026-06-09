/**
 * MongoDB connection management using Mongoose.
 *
 * Architecture decisions:
 * - Connection retry logic with exponential backoff handles transient network issues
 * - Graceful shutdown listeners ensure connections are properly closed
 * - Connection event listeners provide observability without external monitoring
 *
 * Why not connection pooling configuration?
 * Mongoose 7+ uses the MongoDB Node.js driver's built-in connection pooling (default: 100).
 * The defaults are appropriate for most applications. We'd only tune this under measured
 * load testing that showed connection contention.
 */

import mongoose from "mongoose";
import { env, isProduction } from "./environment";

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 5000;

export async function connectDatabase(): Promise<void> {
  let retries = 0;

  mongoose.set("strictQuery", true);

  if (!isProduction) {
    mongoose.set(
      "debug",
      (collectionName: string, method: string, query: unknown) => {
        console.log(
          `[Mongoose] ${collectionName}.${method}`,
          JSON.stringify(query),
        );
      },
    );
  }

  while (retries < MAX_RETRIES) {
    try {
      await mongoose.connect(env.mongodbUri, {
        maxPoolSize: isProduction ? 50 : 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      console.log("[Database] MongoDB connected successfully");
      registerConnectionEvents();
      return;
    } catch (error) {
      retries++;
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error(
        `[Database] Connection attempt ${retries}/${MAX_RETRIES} failed: ${message}`,
      );

      if (retries === MAX_RETRIES) {
        throw new Error(
          `[Database] Unable to connect after ${MAX_RETRIES} attempts`,
        );
      }

      const delay = RETRY_DELAY_MS * Math.pow(2, retries - 1);
      console.log(`[Database] Retrying in ${delay / 1000}s...`);
      await sleep(delay);
    }
  }
}

function registerConnectionEvents(): void {
  mongoose.connection.on("disconnected", () => {
    console.warn("[Database] MongoDB disconnected");
  });

  mongoose.connection.on("error", (err) => {
    console.error("[Database] MongoDB connection error:", err.message);
  });

  mongoose.connection.on("reconnected", () => {
    console.log("[Database] MongoDB reconnected");
  });
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
  console.log("[Database] MongoDB disconnected gracefully");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
