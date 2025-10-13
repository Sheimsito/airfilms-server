import { Router } from "express";
import authController from "../controllers/authController";
import { rateLimiter } from "../middleware/auth";



const router = Router();

// Create a new user
router.post("/register", authController.register);

// Login a user
router.post("/login", rateLimiter, authController.login);

// Logout a user
router.post("/logout", authController.logout);

// Forgot password
router.post("/forgot-password", authController.forgotPassword);

export default router;