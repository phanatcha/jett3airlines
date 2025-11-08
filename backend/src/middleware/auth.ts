import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractTokenFromHeader, JWTPayload } from '../utils/auth';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

// Type for authenticated requests
export interface AuthenticatedRequest extends Request {
  user?: JWTPayload & { clientId?: number };
}

/**
 * Authentication middleware to verify JWT tokens
 */
export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      res.status(401).json({
        success: false,
        error: {
          code: 'MISSING_TOKEN',
          message: 'Access token is required'
        }
      });
      return;
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
    
    let errorCode = 'AUTH_FAILED';
    let statusCode = 401;
    
    if (errorMessage === 'Token expired') {
      errorCode = 'TOKEN_EXPIRED';
    } else if (errorMessage === 'Invalid token') {
      errorCode = 'INVALID_TOKEN';
    }

    res.status(statusCode).json({
      success: false,
      error: {
        code: errorCode,
        message: errorMessage
      }
    });
  }
};

/**
 * Optional authentication middleware - doesn't fail if no token provided
 */
export const optionalAuth = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (token) {
      const decoded = verifyToken(token);
      req.user = decoded;
    }
    
    next();
  } catch (error) {
    // For optional auth, we continue even if token verification fails
    next();
  }
};

/**
 * Middleware to check if user is authenticated (has valid user in request)
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: {
        code: 'AUTHENTICATION_REQUIRED',
        message: 'Authentication is required to access this resource'
      }
    });
    return;
  }
  
  next();
};

/**
 * Middleware to check if the authenticated user matches the requested client_id
 */
export const requireOwnership = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: {
        code: 'AUTHENTICATION_REQUIRED',
        message: 'Authentication is required'
      }
    });
    return;
  }

  const requestedClientId = parseInt(req.params.clientId || req.body.client_id);
  
  if (isNaN(requestedClientId) || req.user.client_id !== requestedClientId) {
    res.status(403).json({
      success: false,
      error: {
        code: 'ACCESS_DENIED',
        message: 'You can only access your own resources'
      }
    });
    return;
  }
  
  next();
};