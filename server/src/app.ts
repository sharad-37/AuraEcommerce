/**
 * Express application configuration.
 *
 * Middleware ordering matters:
 * 1. Security headers (helmet) — first, to protect all responses
 * 2. CORS — before any route handling
 * 3. Compression — before response bodies are sent
 * 4. Rate limiting — before expensive operations
 * 5. Body parsing — before routes that need request bodies
 * 6. Request logging — after parsing, before route handling
 * 7. Routes
 * 8. Error handling — last, catches everything that fell through
 */

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { env, isDevelopment } from "./config/environment";
import routes from "./routes";
import { errorHandler } from "./middleware/error-handler";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: env.corsOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(compression());

const limiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: env.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later",
  },
});
app.use("/api", limiter);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

if (isDevelopment) {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api", routes);

app.use(errorHandler);

export default app;
