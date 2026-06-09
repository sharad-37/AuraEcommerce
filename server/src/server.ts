/**
 * Server entry point.
 *
 * Separating app configuration (app.ts) from server startup (server.ts)
 * allows the Express app to be imported independently for testing
 * without starting the HTTP listener.
 */

import app from "./app";
import { env } from "./config/environment";
import { connectDatabase, disconnectDatabase } from "./config/database";

async function startServer(): Promise<void> {
  try {
    await connectDatabase();

    const server = app.listen(env.port, () => {
      console.log(`[Server] AuraEcommerce API running on port ${env.port}`);
      console.log(`[Server] Environment: ${env.nodeEnv}`);
      console.log(`[Server] Health check: http://localhost:${env.port}/health`);
    });

    const gracefulShutdown = async (signal: string): Promise<void> => {
      console.log(
        `\n[Server] ${signal} received. Starting graceful shutdown...`,
      );

      server.close(async () => {
        console.log("[Server] HTTP server closed");
        await disconnectDatabase();
        process.exit(0);
      });

      setTimeout(() => {
        console.error("[Server] Forceful shutdown after timeout");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));

    process.on("unhandledRejection", (reason) => {
      console.error("[Server] Unhandled Rejection:", reason);
    });

    process.on("uncaughtException", (error) => {
      console.error("[Server] Uncaught Exception:", error);
      process.exit(1);
    });
  } catch (error) {
    console.error("[Server] Failed to start:", error);
    process.exit(1);
  }
}

startServer();
