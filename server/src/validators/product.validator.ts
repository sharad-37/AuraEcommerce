import { query } from "express-validator";

export const productQueryValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Limit must be between 1 and 50"),
  query("category").optional().trim().isString(),
  query("search").optional().trim().isString(),
  query("sort")
    .optional()
    .isIn(["price_asc", "price_desc", "newest", "name"])
    .withMessage("Invalid sort option"),
];
