import { body } from "express-validator";

export const addToCartValidation = [
  body("productId")
    .notEmpty()
    .withMessage("Product ID is required")
    .isMongoId()
    .withMessage("Invalid product ID"),
  body("quantity")
    .isInt({ min: 1, max: 99 })
    .withMessage("Quantity must be between 1 and 99"),
];
