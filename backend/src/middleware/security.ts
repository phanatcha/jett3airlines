import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';
import config from '../config/config';

/**
 * Rate limiting middleware
 */
export const createRateLimiter = (windowMs?: number, max?: number) => {
  return rateLimit({
    windowMs: windowMs || config.rateLimit.windowMs,
    max: max || config.rateLimit.maxRequests,
    message: {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests from this IP, please try again later'
      }
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

/**
 * General rate limiter for most endpoints
 */
export const generalRateLimit = createRateLimiter();

/**
 * Stricter rate limiter for authentication endpoints
 * More lenient in development for testing
 */
const isDevelopment = process.env.NODE_ENV === 'development';
export const authRateLimit = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  isDevelopment ? 50 : 5 // 50 requests in dev, 5 in production
);

/**
 * Security headers middleware
 */
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

/**
 * CORS configuration middleware
 */
export const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

/**
 * Error handling middleware for security-related errors
 */
export const securityErrorHandler = (error: any, req: Request, res: Response, next: NextFunction): void => {
  // Log security-related errors
  if (error.type === 'entity.too.large') {
    res.status(413).json({
      success: false,
      error: {
        code: 'PAYLOAD_TOO_LARGE',
        message: 'Request payload too large'
      }
    });
    return;
  }

  if (error.type === 'charset.unsupported') {
    res.status(415).json({
      success: false,
      error: {
        code: 'UNSUPPORTED_CHARSET',
        message: 'Unsupported charset'
      }
    });
    return;
  }

  next(error);
};