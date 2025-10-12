import { Router } from "express";
import authController from "../controllers/authController";


const router = Router();

// Create a new user
router.post("/register", authController.register);

export default router;