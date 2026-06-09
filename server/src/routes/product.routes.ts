import { Router } from "express";
import * as productController from "../controllers/product.controller";
import { validate } from "../middleware/validate";
import { productQueryValidation } from "../validators/product.validator";

const router = Router();

router.get(
  "/",
  validate(productQueryValidation),
  productController.getProducts,
);
router.get("/categories", productController.getCategories);
router.get("/:id", productController.getProductById);

export default router;
