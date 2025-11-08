import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';

/**
 * Error response interface
 */
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
  path?: string;
}

/**
 * Global error handling middleware
 * Catches all errors and formats them consistently
 */
export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Default error values
  let statusCode = 500;
  let errorCode = 'INTERNAL_ERROR';
  let message = 'An unexpected error occurred';
  let details: any = undefined;
  let isOperational = false;

  // Check if it's our custom AppError
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    errorCode = error.code;
    message = error.message;
    details = error.details;
    isOperational = error.isOperational;
  } else if (error.name === 'ValidationError') {
    // Handle express-validator errors
    statusCode = 422;
    errorCode = 'VALIDATION_ERROR';
    message = error.message;
  } else if (error.name === 'UnauthorizedError') {
    // Handle JWT errors
    statusCode = 401;
    errorCode = 'UNAUTHORIZED';
    message = 'Invalid or expired token';
  } else if (error.name === 'SyntaxError' && 'body' in error) {
    // Handle JSON parsing errors
    statusCode = 400;
    errorCode = 'INVALID_JSON';
    message = 'Invalid JSON in request body';
  }

  // Log error details for debugging
  if (process.env.NODE_ENV !== 'production' || !isOperational) {
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      statusCode,
      errorCode,
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString()
    });
  }

  // Build error response
  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      code: errorCode,
      message: message,
      ...(details && { details })
    },
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV !== 'production' && { path: req.path })
  };

  // Add stack trace in development mode
  if (process.env.NODE_ENV !== 'production' && error.stack) {
    (errorResponse.error as any).stack = error.stack;
  }

  // Send error response
  res.status(statusCode).json(errorResponse);
};

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors and pass them to error middleware
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Not found handler
 * Catches all unmatched routes
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = new AppError(
    `Cannot ${req.method} ${req.path}`,
    404,
    'NOT_FOUND',
    true,
    {
      method: req.method,
      path: req.path
    }
  );
  next(error);
};

/**
 * Validation error formatter
 * Formats express-validator errors consistently
 */
export const formatValidationErrors = (errors: any[]): any => {
  return errors.map(error => ({
    field: error.type === 'field' ? error.path : 'unknown',
    message: error.msg,
    value: error.type === 'field' ? error.value : undefined,
    location: error.location
  }));
};
