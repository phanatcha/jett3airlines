import { Request, Response, NextFunction } from 'express';
import { AuthenticationError, AuthorizationError } from '../utils/errors';

/**
 * Middleware to check if the authenticated user is an admin
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    // Check if user has admin role
    if (req.user.role !== 'admin') {
      throw new AuthorizationError('Admin access required');
    }

    // User is admin, proceed
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if the authenticated user is an admin or accessing their own resources
 */
export const requireAdminOrSelf = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    // Get the client_id from request params or body
    const targetClientId = parseInt(req.params.clientId || req.params.id || req.body.client_id);

    // Check if user is admin or accessing their own resources
    if (req.user.role === 'admin' || req.user.client_id === targetClientId) {
      next();
      return;
    }

    // User is neither admin nor accessing their own resources
    throw new AuthorizationError('Access denied');
  } catch (error) {
    next(error);
  }
};
