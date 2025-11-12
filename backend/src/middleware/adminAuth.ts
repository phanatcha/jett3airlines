import { Request, Response, NextFunction } from 'express';
import { AuthenticationError, AuthorizationError } from '../utils/errors';

export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  try {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    if (req.user.role !== 'admin') {
      throw new AuthorizationError('Admin access required');
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const requireAdminOrSelf = (req: Request, res: Response, next: NextFunction): void => {
  try {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    const targetClientId = parseInt(req.params.clientId || req.params.id || req.body.client_id);

    if (req.user.role === 'admin' || req.user.client_id === targetClientId) {
      next();
      return;
    }

    throw new AuthorizationError('Access denied');
  } catch (error) {
    next(error);
  }
};
