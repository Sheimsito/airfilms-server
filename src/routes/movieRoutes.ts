import { Router } from "express";
import movieController from "../controllers/movieController.js";
import favoritesController from "../controllers/favoritesController.js";
import { authenticateToken } from "../middleware/auth.js";
import commentController from "../controllers/commentController.js";
import ratingController from "../controllers/ratingController.js";

const router = Router();

// Movie Controller Routes
router.get("/popular", movieController.getPopularMovies);
router.get("/genre", movieController.searchGenreMovies);
router.get("/details", movieController.getMovieDetails);
router.get("/search", movieController.searchMovies);

// Favorites Controller Routes
router.post("/add-favorite", authenticateToken, favoritesController.insertFavorite);
router.delete("/delete-favorite", authenticateToken, favoritesController.deleteFavorite);
router.get("/get-favorites", authenticateToken, favoritesController.findFavorites);

// Comment Controller Routes
router.post("/add-comment", authenticateToken, commentController.insertComment);
router.delete("/delete-comment", authenticateToken, commentController.deleteComment);
router.get("/get-comments/:movieId", commentController.findComments);

// Rating Controller Routes
router.post("/add-rating", authenticateToken, ratingController.createRating);
router.delete("/delete-rating", authenticateToken, ratingController.deleteRating);
router.get("/get-ratings/:movieId", ratingController.findRatings);



// Video Controller Routes
router.get("/get-video", movieController.searchVideoById);
export default router;
