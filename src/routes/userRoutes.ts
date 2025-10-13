import { Router } from "express";
import authController from "../controllers/authController";


const router = Router();

// Create a new user
router.post("/register", authController.register);

// Login a user
router.post("/login", authController.login);

// Logout a user
router.post("/logout", authController.logout);

export default router;