/**
 * Central route registry.
 *
 * All routes are prefixed under /api to clearly separate API endpoints
 * from any static file serving. This is a convention that makes reverse
 * proxy configuration (nginx) straightforward.
 */

import { Router } from "express";
import authRoutes from "./auth.routes";
import productRoutes from "./product.routes";
import cartRoutes from "./cart.routes";
import orderRoutes from "./order.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/cart", cartRoutes);
router.use("/orders", orderRoutes);

export default router;
