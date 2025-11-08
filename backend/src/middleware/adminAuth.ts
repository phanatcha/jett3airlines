import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to check if the authenticated user is an admin
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'AUTHENTICATION_REQUIRED',
          message: 'Authentication required'
        }
      });
      return;
    }

    // Check if user has admin role
    if (req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        error: {
          code: 'ADMIN_ACCESS_REQUIRED',
          message: 'Admin access required'
        }
      });
      return;
    }

    // User is admin, proceed
    next();
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error'
      }
    });
  }
};

/**
 * Middleware to check if the authenticated user is an admin or accessing their own resources
 */
export const requireAdminOrSelf = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'AUTHENTICATION_REQUIRED',
          message: 'Authentication required'
        }
      });
      return;
    }

    // Get the client_id from request params or body
    const targetClientId = parseInt(req.params.clientId || req.params.id || req.body.client_id);

    // Check if user is admin or accessing their own resources
    if (req.user.role === 'admin' || req.user.client_id === targetClientId) {
      next();
      return;
    }

    // User is neither admin nor accessing their own resources
    res.status(403).json({
      success: false,
      error: {
        code: 'ACCESS_DENIED',
        message: 'Access denied'
      }
    });
  } catch (error) {
    console.error('Admin or self auth middleware error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error'
      }
    });
  }
};
