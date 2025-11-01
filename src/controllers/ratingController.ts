import { Request, Response, NextFunction } from "express";
import config from "../config/config.js";
import { ratingDAO } from "../dao/ratingDAO.js";


/**
 * @description Find all ratings of a movie
 * 
 * @async 
 * @function findRatings
 * @param req: Request
 * @param res: Response
 * @param next: NextFunction
 * @returns Promise<void>
 */

const findRatings = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { movieId } = req.params;
        const ratings = await ratingDAO.listByMovieId(movieId);
        const ratingNumbers = await ratingDAO.listRatingNumbers(movieId);
        return res.status(200).json({ success: true, ratings, ratingNumbers });
    } catch (err: unknown) {
        if (config.nodeEnv === "development") {
            console.error(err instanceof Error ? err.message : "Error interno del servidor");
        }
        res.status(500).json({ success: false, message: "Error interno del servidor." });
    }
};

interface createRatingBody {
    movieId: number;
    rating: number;
}

/** @description Create a new rating for a movie
 * 
 * @async 
 * @function createRating
 * @param req: Request
 * @param res: Response
 * @param next: NextFunction
 * @returns Promise<void>
 */
const createRating = async (req: Request <{}, {}, createRatingBody>, res: Response, next: NextFunction) => {
    try {
        enum Rating {
            MIN = 0,
            MAX = 5
        }

        const { movieId , rating } = req.body ;
        const movieIdNumber = Number(movieId);
        const ratingNumber = Number(rating);
        const userId: string = (req as any).user?.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Usuario no autenticado." });
        }
        if (!movieIdNumber || !ratingNumber || !Number.isFinite(movieIdNumber) || !Number.isFinite(ratingNumber) || movieIdNumber < 1 || ratingNumber < Rating.MIN || ratingNumber > Rating.MAX) {
            return res.status(400).json({ success: false, message: "Se requiere el id de la película y la calificación del usuario entre 1 y 5." });
        }
        const ratingCreated = await ratingDAO.createRating({ movieId: movieIdNumber, userId, rating: ratingNumber });
        return res.status(201).json({ success: true, ratingCreated });
    } catch (err: unknown) {
        if (config.nodeEnv === "development") {
            console.error(err instanceof Error ? err.message : "Error interno del servidor");
        }
        res.status(500).json({ success: false, message: "Error interno del servidor." });
    }
};


/** @description Delete a rating for a movie
 * 
 * @async 
 * @function deleteRating
 * @param req: Request
 * @param res: Response
 * @param next: NextFunction
 * @returns Promise<void>
 */

const deleteRating = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { movieId } = req.body;
        const movieIdNumber = Number(movieId);
        const userId: string = (req as any).user?.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Usuario no autenticado." });
        }
        if (!movieIdNumber || !Number.isFinite(movieIdNumber) || movieIdNumber < 1) {
            return res.status(400).json({ success: false, message: "Se requiere el id de la película." });
        }
        const ratingDeleted = await ratingDAO.deleteByComposite(userId, movieIdNumber);
        if(!ratingDeleted){
            return res.status(404).json({ success: false, message: "Calificación no encontrada." });
        }
        return res.status(200).json({ success: true, ratingDeleted });
    } catch (err: unknown) {
        if (config.nodeEnv === "development") {
            console.error(err instanceof Error ? err.message : "Error interno del servidor");
        }
        res.status(500).json({ success: false, message: "Error interno del servidor." });
    }
};

export default { findRatings, createRating, deleteRating };

