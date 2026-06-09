import { Router } from "express";
import * as orderController from "../controllers/order.controller";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createOrderValidation } from "../validators/order.validator";

const router = Router();

router.use(authenticate as never);

router.post(
  "/",
  validate(createOrderValidation),
  orderController.createOrder as never,
);
router.get("/", orderController.getOrders as never);
router.get("/:id", orderController.getOrderById as never);

export default router;
