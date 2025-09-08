import { Router } from "express";
const router = Router();
import authController from "../controllers/authController.js";

router.post("/register",authController.registerController)
router.post("/login",authController.loginController)

export default router;