import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { validate } from "../middleware/validate";
import {
  registerValidation,
  loginValidation,
} from "../validators/auth.validator";

const router = Router();

router.post("/register", validate(registerValidation), authController.register);
router.post("/login", validate(loginValidation), authController.login);
router.post("/refresh", authController.refresh);

export default router;
