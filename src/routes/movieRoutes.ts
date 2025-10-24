import { Router } from "express";
import movieController from "../controllers/movieController.js";
import favoritesController from "../controllers/favoritesController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

// Movie Controller Routes
router.get("/popular", movieController.getPopularMovies);
router.get("/details", movieController.getMovieDetails);
router.get("/search", movieController.searchMovies);

// Favorites Controller Routes
router.post("/add-favorite", authenticateToken, favoritesController.insertFavorite);
router.delete("/delete-favorite", authenticateToken, favoritesController.deleteFavorite);
router.get("/get-favorites", authenticateToken, favoritesController.findFavorites);

// Video Controller Routes
router.get("/get-video", movieController.searchVideoById);
export default router;
