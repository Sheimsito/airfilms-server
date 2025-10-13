import { Router } from "express";
import userRoutes from "./userRoutes";
import { authenticateToken } from "../middleware/auth";
import authRoutes from "./authRoutes";

const router = Router();



router.use("/auth", authRoutes);

// Then implement the protected routes here. ( by Auth.js )

router.use("/users",authenticateToken , userRoutes);

export default router;
