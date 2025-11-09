/**
 * Custom error classes for different error types
 * These provide consistent error handling across the application
 */

/**
 * Base application error class
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly details?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    isOperational: boolean = true,
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.details = details;

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
    
    // Set the prototype explicitly to maintain instanceof checks
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Validation error - for input validation failures
 */
export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', details?: any) {
    super(message, 422, 'VALIDATION_ERROR', true, details);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Authentication error - for authentication failures
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed', details?: any) {
    super(message, 401, 'AUTHENTICATION_ERROR', true, details);
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

/**
 * Authorization error - for permission denied scenarios
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied', details?: any) {
    super(message, 403, 'AUTHORIZATION_ERROR', true, details);
    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }
}

/**
 * Not found error - for resource not found scenarios
 */
export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource', details?: any) {
    super(`${resource} not found`, 404, 'NOT_FOUND', true, details);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * Conflict error - for resource conflicts (e.g., duplicate entries, seat already booked)
 */
export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict', details?: any) {
    super(message, 409, 'CONFLICT_ERROR', true, details);
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

/**
 * Database error - for database operation failures
 */
export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed', details?: any) {
    super(message, 500, 'DATABASE_ERROR', true, details);
    Object.setPrototypeOf(this, DatabaseError.prototype);
  }
}

/**
 * Bad request error - for malformed requests
 */
export class BadRequestError extends AppError {
  constructor(message: string = 'Bad request', details?: any) {
    super(message, 400, 'BAD_REQUEST', true, details);
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}

/**
 * Rate limit error - for rate limiting violations
 */
export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests', details?: any) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED', true, details);
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

/**
 * Payment error - for payment processing failures
 */
export class PaymentError extends AppError {
  constructor(message: string = 'Payment processing failed', details?: any) {
    super(message, 402, 'PAYMENT_ERROR', true, details);
    Object.setPrototypeOf(this, PaymentError.prototype);
  }
}

/**
 * Service unavailable error - for temporary service issues
 */
export class ServiceUnavailableError extends AppError {
  constructor(message: string = 'Service temporarily unavailable', details?: any) {
    super(message, 503, 'SERVICE_UNAVAILABLE', true, details);
    Object.setPrototypeOf(this, ServiceUnavailableError.prototype);
  }
}

/**
 * Helper function to check if an error is operational
 */
export const isOperationalError = (error: Error): boolean => {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
};
