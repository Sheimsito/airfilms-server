import { Request, Response, NextFunction } from "express";
import config from "../config/config.js";
import { commentDAO } from "../dao/commentDAO.js";





/**
 * @description Find all comments of a movie with pagination and filters ( OPTIONAL )
 * 
 * @async 
 * @function findComments
 * @param req: Request
 * @param res: Response
 * @param next: NextFunction
 * @returns Promise<void>
 */
const findComments = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { movieId } = req.params;
        if (!movieId || !Number.isFinite(Number(movieId)) || Number(movieId) < 1) {
            return res.status(400).json({ success: false, message: "Se requiere el id de la película." });
        }
        const { filters, limit, offset, orderBy, page } = req.query;
        const comments = await commentDAO.listByMovieId(Number(movieId), {
            filters: filters ? JSON.parse(filters as string) : {},
            limit: limit ? Number(limit) : 20,
            offset: offset ? Number(offset) : 0,
            page: page ? Number(page) : 1,
            orderBy: orderBy ? JSON.parse(orderBy as string) : undefined,
        });
        return res.status(200).json({ success: true, comments });
    } catch (err: unknown) {
        if (config.nodeEnv === "development") {
            console.error(err instanceof Error ? err.message : "Error interno del servidor");
        }
        res.status(500).json({ success: false, message: "Error interno del servidor." });
    }
};
interface CreateCommentBody {
    movieId: number;
    comment: string;
}

/**
 * @description Create a new comment for a movie
 * 
 * @async 
 * @function createComment
 * @param req: Request
 * @param res: Response
 * @param next: NextFunction
 * @returns Promise<void>
 */
const insertComment = async (req: Request<{}, {}, CreateCommentBody>, res: Response, next: NextFunction) => {
    try {
        if (!req.body) {
            return res.status(400).json({ success: false, message: "Se requieren el id de la película y el comentario del usuario." });
        }
        const { movieId,comment } = req.body;
        if(!movieId || !comment){
            return res.status(400).json({ success: false, message: "Se requieren el id de la película y el comentario del usuario." });
        }
        const userId: string = (req as any).user?.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Usuario no autenticado." });
        }
        const commentCreated = await commentDAO.create({ movieId, userId, comment });
        return res.status(201).json({ success: true, commentCreated });
    } catch (err: unknown) {
        if (config.nodeEnv === "development") {
            console.error(err instanceof Error ? err.message : "Error interno del servidor");
        }
        res.status(500).json({ success: false, message: "Error interno del servidor." });
    }
};

interface DeleteCommentBody {
    id: string;
    movieId: number;
}

/**
 * @description Delete a comment for a movie
 * 
 * @async 
 * @function deleteComment
 * @param req: Request
 * @param res: Response
 * @param next: NextFunction
 * @returns Promise<void>
 */

const deleteComment = async (req: Request<{}, {}, DeleteCommentBody>, res: Response, next: NextFunction) => {
    try {
        const { id, movieId } = req.body;
        const userId: string = (req as any).user?.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Usuario no autenticado." });
        }
        const isValidId = typeof id === 'string' && id.trim().length > 0 && /[a-f0-9-]{10,}/i.test(id);
        const isValidMovieId = Number.isFinite(Number(movieId)) && Number(movieId) > 0;
        if (!isValidId || !isValidMovieId) {
            return res.status(400).json({ success: false, message: "Se requiere un id de comentario válido y el id de la película." });
        }
        const commentDeleted = await commentDAO.deleteSpecificComentary(userId, id, Number(movieId));
        if(!commentDeleted){
            return res.status(404).json({ success: false, message: "Comentario no encontrado." });
        }
        return res.status(200).json({ success: true, commentDeleted });
    } catch (err: unknown) {
        if (config.nodeEnv === "development") {
            console.error(err instanceof Error ? err.message : "Error interno del servidor");
        }
        res.status(500).json({ success: false, message: "Error interno del servidor." });
    }
};


export default { findComments, insertComment, deleteComment };