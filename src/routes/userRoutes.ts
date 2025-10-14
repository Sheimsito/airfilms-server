import { Router } from "express";
import userController from "../controllers/userController.js";

const router = Router();

// Note: All routes here are already protected by authenticateToken in routes/index.ts

// Get user profile
router.get("/profile", userController.getUserProfile);

// Update user profile
router.put("/profile", userController.updateUserProfile);

// Soft delete user profile
router.delete("/profile", userController.softDeleteAccount); 


export default router;