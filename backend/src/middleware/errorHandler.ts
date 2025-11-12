import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';

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

export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500;
  let errorCode = 'INTERNAL_ERROR';
  let message = 'An unexpected error occurred';
  let details: any = undefined;
  let isOperational = false;

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    errorCode = error.code;
    message = error.message;
    details = error.details;
    isOperational = error.isOperational;
  } else if (error.name === 'ValidationError') {
    statusCode = 422;
    errorCode = 'VALIDATION_ERROR';
    message = error.message;
  } else if (error.name === 'UnauthorizedError') {
    statusCode = 401;
    errorCode = 'UNAUTHORIZED';
    message = 'Invalid or expired token';
  } else if (error.name === 'SyntaxError' && 'body' in error) {
    statusCode = 400;
    errorCode = 'INVALID_JSON';
    message = 'Invalid JSON in request body';
  }

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

  if (process.env.NODE_ENV !== 'production' && error.stack) {
    (errorResponse.error as any).stack = error.stack;
  }

  res.status(statusCode).json(errorResponse);
};

export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

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

export const formatValidationErrors = (errors: any[]): any => {
  return errors.map(error => ({
    field: error.type === 'field' ? error.path : 'unknown',
    message: error.msg,
    value: error.type === 'field' ? error.value : undefined,
    location: error.location
  }));
};
