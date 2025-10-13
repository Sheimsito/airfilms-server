import { Request, Response, NextFunction } from "express";



// This is the type for the app error
export interface AppError extends Error {
    name: string;
    statusCode?: number;
    message: string;
    code?: string | number;
    details?: string;
    hint?: string;
}




/**
 * Express middleware for handling 404 "Not Found" errors.
 * Creates an error object with a descriptive message when 
 * the requested route does not exist and passes it to the next error handler.
 *
 * @param {import("express").Request} req - Express request object.
 * @param {import("express").Response} res - Express response object.
 * @param {import("express").NextFunction} next - Callback to pass control to the next middleware.
 * @returns {void}
 * 
 * 
 */
const notFound = (req: Request, res: Response, next: NextFunction) => {
    const error: AppError = new Error(`Ruta no encontrada - ${req.originalUrl}`);
    res.status(404);
    error.statusCode = 404;
    error.name = 'NotFound';
    error.message = `Ruta no encontrada - ${req.originalUrl}`;
    next(error);
};

export default notFound;
