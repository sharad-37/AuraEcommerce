import { body } from "express-validator";

export const createOrderValidation = [
  body("customerName")
    .trim()
    .notEmpty()
    .withMessage("Customer name is required")
    .isLength({ max: 100 })
    .withMessage("Customer name cannot exceed 100 characters"),
  body("address")
    .trim()
    .notEmpty()
    .withMessage("Delivery address is required")
    .isLength({ max: 500 })
    .withMessage("Address cannot exceed 500 characters"),
  body("mobile")
    .trim()
    .notEmpty()
    .withMessage("Mobile number is required")
    .matches(/^[+]?[\d\s\-()]{7,20}$/)
    .withMessage("Please provide a valid mobile number"),
];
