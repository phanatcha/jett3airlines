import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractTokenFromHeader, JWTPayload } from '../utils/auth';
import { AuthenticationError, AuthorizationError } from '../utils/errors';

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export interface AuthenticatedRequest extends Request {
  user?: JWTPayload & { clientId?: number };
}

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

export const optionalAuth = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (token) {
      const decoded = verifyToken(token);
      req.user = decoded;
    }
    
    next();
  } catch (error) {
    next();
  }
};

export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    next(new AuthenticationError('Authentication is required to access this resource'));
    return;
  }
  
  next();
};

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