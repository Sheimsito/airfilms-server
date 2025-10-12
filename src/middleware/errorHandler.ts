import type { Request, Response, NextFunction } from "express";

// This is the type for the app error
export interface AppError extends Error {
    statusCode: number;
    message: string;
}

// This is the basic error handler middleware
export const errorHandler = (err: AppError, req: Request, res: Response, next: NextFunction) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(statusCode).json({
        success: false,
        statusCode,
        message
    });
}