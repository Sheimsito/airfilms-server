import { Request, Response, NextFunction } from "express";
import config from "../config/config.js";      
import { favoritesDAO } from "../dao/favoritesDAO.js";

/** 
 * @description Find all favorites movies of a user
 * 
 * @async 
 * @function findFavorites
 * @param req: Request
 * @param res: Response
 * @param next: NextFunction
 * @returns Promise<void>
 */
const findFavorites = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId: string = (req as any).user?.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Usuario no autenticado." });
        }
        const favorites = await favoritesDAO.findFavorites(userId);
        if (favorites.length === 0) {
            return res.status(404).json({ success: false, message: "No se encontraron favoritos." });
        }
        return res.status(200).json({ success: true, favorites });
    } catch (err: unknown) {
        if (config.nodeEnv === "development") {
            console.error(err instanceof Error ? err.message : "Error interno del servidor");
        }
        res.status(500).json({ success: false, message: "Error interno del servidor." });
    }
};



/** 
 * @description Insert a favorite movie
 * 
 * @async 
 * @function insertFavorite
 * @param req: Request
 * @param res: Response
 * @param next: NextFunction
 * @returns Promise<void>
 */
const insertFavorite = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { movieId, movieName, movieURL } = req.body;
        const userId: string = (req as any).user?.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Usuario no autenticado." });
        }
        const favorite = await favoritesDAO.create({ movieId: movieId, userId: userId, movieName: movieName, posterURL: movieURL });
        
        return res.status(201).json({ success: true, favorite });
    } catch (err: unknown) {
        if (config.nodeEnv === "development") {
            console.error(err instanceof Error ? err.message : "Error interno del servidor");
        }
        if(err instanceof Error && err.message.includes("duplicate key")){
            return res.status(500).json({ success: false, message: "Ya tienes esta película en tus favoritos." });
        }
        res.status(500).json({ success: false, message: "Error interno del servidor." });
    }
};


/** 
 * @description Delete a favorite movie
 * 
 * @async 
 * @function deleteFavorite
 * @param req: Request
 * @param res: Response
 * @param next: NextFunction
 * @returns Promise<void>
 */
const deleteFavorite = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { movieId } = req.body;
        const userId: string = (req as any).user?.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Usuario no autenticado." });
        }
        const favorite = await favoritesDAO.deleteByComposite(userId, movieId);
        if (!favorite) {
            return res.status(404).json({ success: false, message: "No se encontró el favorito." });
        }
        return res.status(200).json({ success: true });
    } catch (err: unknown) {
        if (config.nodeEnv === "development") {
            console.error(err instanceof Error ? err.message : "Error interno del servidor");
        }
        res.status(500).json({ success: false, message: "Error interno del servidor." });
    }
};

export default { insertFavorite, deleteFavorite, findFavorites };
