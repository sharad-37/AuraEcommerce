import { Router } from "express";
import * as cartController from "../controllers/cart.controller";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { addToCartValidation } from "../validators/cart.validator";

const router = Router();

router.use(authenticate as never);

router.get("/", cartController.getCart as never);
router.post(
  "/",
  validate(addToCartValidation),
  cartController.addToCart as never,
);
router.patch("/:id", cartController.updateCartItem as never);
router.delete("/:id", cartController.removeCartItem as never);

export default router;
