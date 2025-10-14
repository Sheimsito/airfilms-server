import type { Request, Response, NextFunction } from "express";
import config from "../config/config.js";


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
 * Express middleware for handling errors.
 *
 * Provides detailed error logging and response formatting.
 * @function errorHandler
 * @param {AppError} err - The error object.
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Callback to pass control to the next middleware.
 */
const errorHandler = (err: AppError, req: Request, res: Response, next: NextFunction) => {
    let error = { ...err };
    error.message = err.message;

    if (config.nodeEnv === 'development') {
        console.error('❌ Error Details:', {
        message: err.message,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
        });
    }

    // Supabase/PostgreSQL errors
    if (err.code) {
        switch (err.code) {
            // Unique constraint violation (duplicate key)
            case '23505':
                error.message = 'Este registro ya existe en la base de datos';
                error.statusCode = 409;
                error.name = 'UniqueViolation';
                break;
            
            // Foreign key violation
            case '23503':
                error.message = 'Violación de restricción de clave foránea';
                error.statusCode = 400;
                error.name = 'ForeignKeyViolation';
                break;
            
            // Not null violation
            case '23502':
                error.message = 'Campo requerido faltante';
                error.statusCode = 400;
                error.name = 'NotNullViolation';
                break;
            
            // Check constraint violation
            case '23514':
                error.message = 'Violación de restricción de validación';
                error.statusCode = 400;
                error.name = 'CheckViolation';
                break;
            
            // Invalid text representation (bad UUID, etc)
            case '22P02':
                error.message = 'Formato de dato inválido';
                error.statusCode = 400;
                error.name = 'InvalidTextRepresentation';
                break;
            
            // Row not found (PGRST116)
            case 'PGRST116':
                error.message = 'Recurso no encontrado';
                error.statusCode = 404;
                error.name = 'NotFound';
                break;
            
            // Permission denied (PGRST301)
            case 'PGRST301':
                error.message = 'No tienes permisos para realizar esta acción';
                error.statusCode = 403;
                error.name = 'PermissionDenied';
                break;
        }
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        const message = 'Token inválido';
        error = { message, statusCode: 401, name: 'JsonWebTokenError' };
    }

    if (err.name === 'TokenExpiredError') {
        const message = 'Token expirado';
        error = { message, statusCode: 401, name: 'TokenExpiredError' };
    }

    // Syntax errors
    if (err.name === 'SyntaxError') {
        const message = 'JSON inválido en el cuerpo de la petición';
        error = { message, statusCode: 400, name: 'SyntaxError' };
    }

    // Rate limiting errors
    if (err.name === 'RateLimitError') {
        const message = 'Demasiadas peticiones, intenta más tarde';
        error = { message, statusCode: 429, name: 'RateLimitError' };
    }

    // Default error
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Error interno del servidor';

    res.status(statusCode).json({
        success: false,
        error: statusCode >= 500 ? 'Intenta de nuevo más tarde' : message,
        ...(config.nodeEnv === 'development' && {
            stack: err.stack,
            details: {
                name: err.name,
                code: err.code || err.statusCode,
                hint: err.hint,
                supabaseDetails: err.details,
                url: req.originalUrl,
                method: req.method
            }
        })
    });
};

export default errorHandler;
