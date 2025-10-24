import { Router } from "express";
import userRoutes from "./userRoutes.js";
import { authenticateToken } from "../middleware/auth.js";
import authRoutes from "./authRoutes.js";
import movieRoutes from "./movieRoutes.js";

const router = Router();



router.use("/auth", authRoutes);

// Then implement the protected routes here. ( by Auth.js )

router.use("/users",authenticateToken , userRoutes);

router.use("/movies", movieRoutes);

export default router;
