import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractTokenFromHeader, JWTPayload } from '../utils/auth';
import { AuthenticationError, AuthorizationError } from '../utils/errors';

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
      throw new AuthenticationError('Access token is required');
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      next(error);
      return;
    }

    const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
    
    if (errorMessage === 'Token expired') {
      next(new AuthenticationError('Token expired'));
    } else if (errorMessage === 'Invalid token') {
      next(new AuthenticationError('Invalid token'));
    } else {
      next(new AuthenticationError(errorMessage));
    }
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
    next(new AuthenticationError('Authentication is required to access this resource'));
    return;
  }
  
  next();
};

/**
 * Middleware to check if the authenticated user matches the requested client_id
 */
export const requireOwnership = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    next(new AuthenticationError('Authentication is required'));
    return;
  }

  const requestedClientId = parseInt(req.params.clientId || req.body.client_id);
  
  if (isNaN(requestedClientId) || req.user.client_id !== requestedClientId) {
    next(new AuthorizationError('You can only access your own resources'));
    return;
  }
  
  next();
};