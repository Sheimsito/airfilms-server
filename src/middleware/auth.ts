import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import config from "../config/config";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    iat?: number;
    exp?: number;
  };
}

const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers["authorization"];
    const token: string | undefined =
      req.cookies?.access_token ||
      (authHeader && authHeader.split(" ")[1]);
  
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token de acceso requerido"
      });
    }
  
    jwt.verify(token, config.jwtSecret, (err: any, user:any) => {
      if (err) {
        return res.status(403).json({
          success: false,
          message: "Token inválido o expirado"
        });
      }
      req.user = user;
      next();
    });
  };
  
  // Rate limiter for the login route
  const loginLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutos
    max: process.env.NODE_ENV === 'production' ? 50 : 100, // More restrictive in production
    message: {
      success: false,
      message: "Demasiados intentos. Espera 5 minutos."
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Use the default generator that handles IPv6 correctly
    skip: (req) => {
      // Skip rate limiting in development with environment variable
      return process.env.NODE_ENV === 'development' && process.env.SKIP_RATE_LIMIT === 'true';
    }
  });

  export { authenticateToken, loginLimiter };