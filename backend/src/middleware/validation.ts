import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult, ValidationChain } from 'express-validator';
import { ValidationError } from '../utils/errors';
import { formatValidationErrors } from './errorHandler';

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = formatValidationErrors(errors.array());
    const error = new ValidationError('Validation failed', formattedErrors);
    next(error);
    return;
  }
  
  next();
};

export const validateRegistration = [
  body('username')
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
    
  body('email')
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),
    
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    
  body('phone_no')
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage('Phone number format is invalid')
    .isLength({ min: 10, max: 20 })
    .withMessage('Phone number must be between 10 and 20 characters'),
    
  body('firstname')
    .isLength({ min: 1, max: 50 })
    .withMessage('First name is required and must be less than 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces'),
    
  body('lastname')
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name is required and must be less than 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces'),
    
  body('dob')
    .isISO8601()
    .withMessage('Date of birth must be a valid date')
    .custom((value) => {
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 18 || age > 120) {
        throw new Error('Age must be between 18 and 120 years');
      }
      return true;
    }),
    
  body('street')
    .isLength({ min: 1, max: 100 })
    .withMessage('Street address is required and must be less than 100 characters'),
    
  body('city')
    .isLength({ min: 1, max: 50 })
    .withMessage('City is required and must be less than 50 characters'),
    
  body('province')
    .isLength({ min: 1, max: 50 })
    .withMessage('Province is required and must be less than 50 characters'),
    
  body('country')
    .isLength({ min: 1, max: 50 })
    .withMessage('Country is required and must be less than 50 characters'),
    
  body('postalcode')
    .matches(/^[A-Za-z0-9\s\-]+$/)
    .withMessage('Postal code format is invalid')
    .isLength({ min: 3, max: 10 })
    .withMessage('Postal code must be between 3 and 10 characters'),
    
  handleValidationErrors
];

export const validateLogin = [
  body('username')
    .notEmpty()
    .withMessage('Username is required'),
    
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
    
  handleValidationErrors
];

export const validateProfileUpdate = [
  body('email')
    .optional()
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),
    
  body('phone_no')
    .optional()
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage('Phone number format is invalid'),
    
  body('firstname')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be less than 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces'),
    
  body('lastname')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be less than 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces'),
    
  body('street')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Street address must be less than 100 characters'),
    
  body('city')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('City must be less than 50 characters'),
    
  body('province')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Province must be less than 50 characters'),
    
  body('country')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Country must be less than 50 characters'),
    
  body('postalcode')
    .optional()
    .matches(/^[A-Za-z0-9\s\-]+$/)
    .withMessage('Postal code format is invalid'),
    
  handleValidationErrors
];

export const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
    
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number'),
    
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match new password');
      }
      return true;
    }),
    
  handleValidationErrors
];

export const validateIdParam = (paramName: string = 'id'): ValidationChain[] => [
  param(paramName)
    .isInt({ min: 1 })
    .withMessage(`${paramName} must be a positive integer`)
];

export const sanitizeInput = (req: Request, res: Response, next: NextFunction): void => {
  const sanitizeValue = (value: any): any => {
    if (typeof value === 'string') {
      return value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '');
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: any = Array.isArray(value) ? [] : {};
      for (const key in value) {
        sanitized[key] = sanitizeValue(value[key]);
      }
      return sanitized;
    }
    return value;
  };

  if (req.body) {
    req.body = sanitizeValue(req.body);
  }
  
  if (req.query) {
    for (const key in req.query) {
      (req.query as any)[key] = sanitizeValue(req.query[key]);
    }
  }
  
  if (req.params) {
    for (const key in req.params) {
      (req.params as any)[key] = sanitizeValue(req.params[key]);
    }
  }
  
  next();
};/*
*
 * Validation for flight search
 */
export const validateFlightSearch = [
  query('depart_airport_id')
    .isInt({ min: 1 })
    .withMessage('Departure airport ID must be a positive integer'),
    
  query('arrive_airport_id')
    .isInt({ min: 1 })
    .withMessage('Arrival airport ID must be a positive integer'),
    
  query('depart_date')
    .isISO8601()
    .withMessage('Departure date must be a valid date (YYYY-MM-DD)')
    .custom((value) => {
      const departDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (departDate < today) {
        throw new Error('Departure date cannot be in the past');
      }
      return true;
    }),
    
  query('passengers')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Number of passengers must be between 1 and 10'),
    
  query('class')
    .optional()
    .isIn(['Economy', 'Premium Economy', 'Business', 'First Class'])
    .withMessage('Seat class must be one of: Economy, Premium Economy, Business, First Class'),
    
  handleValidationErrors
];

export const validateSeatAvailabilityCheck = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Flight ID must be a positive integer'),
    
  body('seat_ids')
    .isArray({ min: 1 })
    .withMessage('Seat IDs must be a non-empty array')
    .custom((seatIds) => {
      if (!seatIds.every((id: any) => Number.isInteger(id) && id > 0)) {
        throw new Error('All seat IDs must be positive integers');
      }
      return true;
    }),
    
  handleValidationErrors
];

export const validateFlightCreation = [
  body('depart_when')
    .isISO8601()
    .withMessage('Departure time must be a valid ISO 8601 datetime')
    .custom((value) => {
      const departTime = new Date(value);
      const now = new Date();
      
      if (departTime <= now) {
        throw new Error('Departure time must be in the future');
      }
      return true;
    }),
    
  body('arrive_when')
    .isISO8601()
    .withMessage('Arrival time must be a valid ISO 8601 datetime')
    .custom((value, { req }) => {
      const arriveTime = new Date(value);
      const departTime = new Date(req.body.depart_when);
      
      if (arriveTime <= departTime) {
        throw new Error('Arrival time must be after departure time');
      }
      return true;
    }),
    
  body('airplane_id')
    .isInt({ min: 1 })
    .withMessage('Airplane ID must be a positive integer'),
    
  body('depart_airport_id')
    .isInt({ min: 1 })
    .withMessage('Departure airport ID must be a positive integer'),
    
  body('arrive_airport_id')
    .isInt({ min: 1 })
    .withMessage('Arrival airport ID must be a positive integer')
    .custom((value, { req }) => {
      if (value === req.body.depart_airport_id) {
        throw new Error('Departure and arrival airports must be different');
      }
      return true;
    }),
    
  body('status')
    .optional()
    .isIn(['Scheduled', 'Delayed', 'Cancelled', 'Boarding', 'Departed', 'Arrived'])
    .withMessage('Status must be one of: Scheduled, Delayed, Cancelled, Boarding, Departed, Arrived'),
    
  handleValidationErrors
];

export const validateFlightUpdate = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Flight ID must be a positive integer'),
    
  body('depart_when')
    .optional()
    .isISO8601()
    .withMessage('Departure time must be a valid ISO 8601 datetime'),
    
  body('arrive_when')
    .optional()
    .isISO8601()
    .withMessage('Arrival time must be a valid ISO 8601 datetime'),
    
  body('airplane_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Airplane ID must be a positive integer'),
    
  body('depart_airport_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Departure airport ID must be a positive integer'),
    
  body('arrive_airport_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Arrival airport ID must be a positive integer'),
    
  body('status')
    .optional()
    .isIn(['Scheduled', 'Delayed', 'Cancelled', 'Boarding', 'Departed', 'Arrived'])
    .withMessage('Status must be one of: Scheduled, Delayed, Cancelled, Boarding, Departed, Arrived'),
    
  handleValidationErrors
];/**

 * Validation for flight status update (admin)
 */
export const validateFlightStatusUpdate = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Flight ID must be a positive integer'),
    
  body('status')
    .isIn(['Scheduled', 'Delayed', 'Cancelled', 'Boarding', 'Departed', 'Arrived'])
    .withMessage('Status must be one of: Scheduled, Delayed, Cancelled, Boarding, Departed, Arrived'),
    
  handleValidationErrors
];/**
 *
 Validation for airplane creation (admin)
 */
export const validateAirplaneCreation = [
  body('type')
    .notEmpty()
    .withMessage('Aircraft type is required')
    .isLength({ max: 100 })
    .withMessage('Aircraft type must be less than 100 characters'),
    
  body('registration')
    .notEmpty()
    .withMessage('Registration is required')
    .matches(/^[A-Z0-9-]+$/)
    .withMessage('Registration must contain only uppercase letters, numbers, and hyphens')
    .isLength({ max: 20 })
    .withMessage('Registration must be less than 20 characters'),
    
  body('reg_country')
    .notEmpty()
    .withMessage('Registration country is required')
    .isLength({ max: 50 })
    .withMessage('Registration country must be less than 50 characters'),
    
  body('MSN')
    .notEmpty()
    .withMessage('Manufacturer Serial Number (MSN) is required')
    .isLength({ max: 50 })
    .withMessage('MSN must be less than 50 characters'),
    
  body('manufacturing_year')
    .isISO8601()
    .withMessage('Manufacturing year must be a valid date')
    .custom((value) => {
      const manufacturingYear = new Date(value).getFullYear();
      const currentYear = new Date().getFullYear();
      
      if (manufacturingYear < 1950 || manufacturingYear > currentYear + 2) {
        throw new Error('Manufacturing year must be between 1950 and current year + 2');
      }
      return true;
    }),
    
  body('capacity')
    .isInt({ min: 1, max: 1000 })
    .withMessage('Capacity must be between 1 and 1000'),
    
  body('min_price')
    .isFloat({ min: 0.01 })
    .withMessage('Minimum price must be greater than 0'),
    
  handleValidationErrors
];

export const validateAirplaneUpdate = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Airplane ID must be a positive integer'),
    
  body('type')
    .optional()
    .notEmpty()
    .withMessage('Aircraft type cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Aircraft type must be less than 100 characters'),
    
  body('registration')
    .optional()
    .notEmpty()
    .withMessage('Registration cannot be empty')
    .matches(/^[A-Z0-9-]+$/)
    .withMessage('Registration must contain only uppercase letters, numbers, and hyphens')
    .isLength({ max: 20 })
    .withMessage('Registration must be less than 20 characters'),
    
  body('reg_country')
    .optional()
    .notEmpty()
    .withMessage('Registration country cannot be empty')
    .isLength({ max: 50 })
    .withMessage('Registration country must be less than 50 characters'),
    
  body('MSN')
    .optional()
    .notEmpty()
    .withMessage('MSN cannot be empty')
    .isLength({ max: 50 })
    .withMessage('MSN must be less than 50 characters'),
    
  body('manufacturing_year')
    .optional()
    .isISO8601()
    .withMessage('Manufacturing year must be a valid date'),
    
  body('capacity')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Capacity must be between 1 and 1000'),
    
  body('min_price')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Minimum price must be greater than 0'),
    
  handleValidationErrors
];

export const validateSeatCreation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Airplane ID must be a positive integer'),
    
  body('seat_no')
    .notEmpty()
    .withMessage('Seat number is required')
    .matches(/^\d+[A-J]$/)
    .withMessage('Seat number must be in format like 1A, 12F, etc.'),
    
  body('class')
    .isIn(['FIRSTCLASS', 'Business', 'PREMIUM_ECONOMY', 'Premium Economy', 'ECONOMY', 'Economy'])
    .withMessage('Seat class must be one of: FIRSTCLASS, Business, PREMIUM_ECONOMY, Premium Economy, ECONOMY, Economy'),
    
  body('price')
    .isFloat({ min: 0.01 })
    .withMessage('Seat price must be greater than 0'),
    
  handleValidationErrors
];

export const validateSeatUpdate = [
  param('seatId')
    .isInt({ min: 1 })
    .withMessage('Seat ID must be a positive integer'),
    
  body('seat_no')
    .optional()
    .notEmpty()
    .withMessage('Seat number cannot be empty')
    .matches(/^\d+[A-J]$/)
    .withMessage('Seat number must be in format like 1A, 12F, etc.'),
    
  body('class')
    .optional()
    .isIn(['FIRSTCLASS', 'Business', 'PREMIUM_ECONOMY', 'Premium Economy', 'ECONOMY', 'Economy'])
    .withMessage('Seat class must be one of: FIRSTCLASS, Business, PREMIUM_ECONOMY, Premium Economy, ECONOMY, Economy'),
    
  body('price')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Seat price must be greater than 0'),
    
  handleValidationErrors
];

export const validateBookingCreation = [
  body('flight_id')
    .isInt({ min: 1 })
    .withMessage('Flight ID must be a positive integer'),
    
  body('passengers')
    .isArray({ min: 1, max: 10 })
    .withMessage('Passengers must be an array with 1-10 passengers'),
    
  body('passengers.*.firstname')
    .notEmpty()
    .withMessage('Passenger first name is required')
    .isLength({ max: 50 })
    .withMessage('First name must be less than 50 characters')
    .matches(/^[a-zA-Z\s\-']+$/)
    .withMessage('First name can only contain letters, spaces, hyphens, and apostrophes'),
    
  body('passengers.*.lastname')
    .notEmpty()
    .withMessage('Passenger last name is required')
    .isLength({ max: 50 })
    .withMessage('Last name must be less than 50 characters')
    .matches(/^[a-zA-Z\s\-']+$/)
    .withMessage('Last name can only contain letters, spaces, hyphens, and apostrophes'),
    
  body('passengers.*.passport_no')
    .notEmpty()
    .withMessage('Passport number is required')
    .isLength({ min: 6, max: 20 })
    .withMessage('Passport number must be between 6 and 20 characters')
    .matches(/^[A-Z0-9]+$/)
    .withMessage('Passport number can only contain uppercase letters and numbers'),
    
  body('passengers.*.nationality')
    .notEmpty()
    .withMessage('Nationality is required')
    .isLength({ max: 50 })
    .withMessage('Nationality must be less than 50 characters'),
    
  body('passengers.*.phone_no')
    .custom((value) => {
      if (value === null || value === undefined || value === '') {
        return true;
      }
      if (!/^\+?[\d\s\-\(\)]+$/.test(value)) {
        throw new Error('Phone number format is invalid');
      }
      return true;
    }),
    
  body('passengers.*.gender')
    .isIn(['Male', 'Female', 'Other'])
    .withMessage('Gender must be Male, Female, or Other'),
    
  body('passengers.*.dob')
    .isISO8601()
    .withMessage('Date of birth must be a valid date')
    .custom((value) => {
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 0 || age > 120) {
        throw new Error('Invalid date of birth');
      }
      return true;
    }),
    
  body('passengers.*.weight_limit')
    .optional()
    .isFloat({ min: 0, max: 50 })
    .withMessage('Weight limit must be between 0 and 50 kg'),
    
  body('passengers.*.seat_id')
    .isInt({ min: 1 })
    .withMessage('Seat ID must be a positive integer'),
    
  body('support')
    .optional()
    .isIn(['yes', 'no'])
    .withMessage('Support must be yes or no'),
    
  body('fasttrack')
    .optional()
    .isIn(['yes', 'no'])
    .withMessage('Fasttrack must be yes or no'),
    
  handleValidationErrors
];

export const validateBookingUpdate = [
  param('bookingId')
    .isInt({ min: 1 })
    .withMessage('Booking ID must be a positive integer'),
    
  body('support')
    .optional()
    .isIn(['yes', 'no'])
    .withMessage('Support must be yes or no'),
    
  body('fasttrack')
    .optional()
    .isIn(['yes', 'no'])
    .withMessage('Fasttrack must be yes or no'),
    
  body('passengers')
    .optional()
    .isArray({ min: 1, max: 10 })
    .withMessage('Passengers must be an array with 1-10 passengers'),
    
  body('passengers.*.passenger_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Passenger ID must be a positive integer'),
    
  body('passengers.*.seat_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Seat ID must be a positive integer'),
    
  handleValidationErrors
];

export const validatePassengerCreation = [
  body('firstname')
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ max: 50 })
    .withMessage('First name must be less than 50 characters')
    .matches(/^[a-zA-Z\s\-']+$/)
    .withMessage('First name can only contain letters, spaces, hyphens, and apostrophes'),
    
  body('lastname')
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ max: 50 })
    .withMessage('Last name must be less than 50 characters')
    .matches(/^[a-zA-Z\s\-']+$/)
    .withMessage('Last name can only contain letters, spaces, hyphens, and apostrophes'),
    
  body('passport_no')
    .notEmpty()
    .withMessage('Passport number is required')
    .isLength({ min: 6, max: 20 })
    .withMessage('Passport number must be between 6 and 20 characters')
    .matches(/^[A-Z0-9]+$/)
    .withMessage('Passport number can only contain uppercase letters and numbers'),
    
  body('nationality')
    .notEmpty()
    .withMessage('Nationality is required')
    .isLength({ max: 50 })
    .withMessage('Nationality must be less than 50 characters'),
    
  body('phone_no')
    .optional()
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage('Phone number format is invalid'),
    
  body('gender')
    .isIn(['Male', 'Female', 'Other'])
    .withMessage('Gender must be Male, Female, or Other'),
    
  body('dob')
    .isISO8601()
    .withMessage('Date of birth must be a valid date')
    .custom((value) => {
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 0 || age > 120) {
        throw new Error('Invalid date of birth');
      }
      return true;
    }),
    
  body('weight_limit')
    .optional()
    .isFloat({ min: 0, max: 50 })
    .withMessage('Weight limit must be between 0 and 50 kg'),
    
  body('seat_id')
    .isInt({ min: 1 })
    .withMessage('Seat ID must be a positive integer'),
    
  body('booking_id')
    .isInt({ min: 1 })
    .withMessage('Booking ID must be a positive integer'),
    
  body('flight_id')
    .isInt({ min: 1 })
    .withMessage('Flight ID must be a positive integer'),
    
  handleValidationErrors
];

export const validatePassengerUpdate = [
  param('passengerId')
    .isInt({ min: 1 })
    .withMessage('Passenger ID must be a positive integer'),
    
  body('firstname')
    .optional()
    .notEmpty()
    .withMessage('First name cannot be empty')
    .isLength({ max: 50 })
    .withMessage('First name must be less than 50 characters')
    .matches(/^[a-zA-Z\s\-']+$/)
    .withMessage('First name can only contain letters, spaces, hyphens, and apostrophes'),
    
  body('lastname')
    .optional()
    .notEmpty()
    .withMessage('Last name cannot be empty')
    .isLength({ max: 50 })
    .withMessage('Last name must be less than 50 characters')
    .matches(/^[a-zA-Z\s\-']+$/)
    .withMessage('Last name can only contain letters, spaces, hyphens, and apostrophes'),
    
  body('passport_no')
    .optional()
    .notEmpty()
    .withMessage('Passport number cannot be empty')
    .isLength({ min: 6, max: 20 })
    .withMessage('Passport number must be between 6 and 20 characters')
    .matches(/^[A-Z0-9]+$/)
    .withMessage('Passport number can only contain uppercase letters and numbers'),
    
  body('nationality')
    .optional()
    .notEmpty()
    .withMessage('Nationality cannot be empty')
    .isLength({ max: 50 })
    .withMessage('Nationality must be less than 50 characters'),
    
  body('phone_no')
    .optional()
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage('Phone number format is invalid'),
    
  body('gender')
    .optional()
    .isIn(['Male', 'Female', 'Other'])
    .withMessage('Gender must be Male, Female, or Other'),
    
  body('dob')
    .optional()
    .isISO8601()
    .withMessage('Date of birth must be a valid date'),
    
  body('weight_limit')
    .optional()
    .isFloat({ min: 0, max: 50 })
    .withMessage('Weight limit must be between 0 and 50 kg'),
    
  body('seat_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Seat ID must be a positive integer'),
    
  handleValidationErrors
];
export const validatePaymentProcessing = [
  body('booking_id')
    .isInt({ min: 1 })
    .withMessage('Booking ID must be a positive integer'),
    
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Payment amount must be greater than 0'),
    
  body('currency')
    .optional()
    .isIn(['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY'])
    .withMessage('Currency must be a valid currency code'),
    
  body('payment_method')
    .optional()
    .isIn(['VISA', 'MASTERCARD', 'AMEX', 'DISCOVER', 'JCB', 'MAESTRO', 'PAYPAL', 'APPLE_PAY'])
    .withMessage('Payment method must be a valid payment type'),
    
  handleValidationErrors
];

export const validateRefundProcessing = [
  param('bookingId')
    .isInt({ min: 1 })
    .withMessage('Booking ID must be a positive integer'),
    
  body('reason')
    .optional()
    .isLength({ min: 1, max: 500 })
    .withMessage('Refund reason must be between 1 and 500 characters'),
    
  handleValidationErrors
];

export const validateBaggageCreation = [
  body('passenger_id')
    .isInt({ min: 1 })
    .withMessage('Passenger ID must be a positive integer'),
    
  body('tracking_no')
    .optional()
    .matches(/^[A-Z0-9]{10,20}$/)
    .withMessage('Tracking number must be 10-20 uppercase alphanumeric characters'),
    
  body('status')
    .optional()
    .isIn(['checked_in', 'in_transit', 'arrived', 'delivered', 'lost'])
    .withMessage('Status must be one of: checked_in, in_transit, arrived, delivered, lost'),
    
  handleValidationErrors
];

export const validateBaggageStatusUpdate = [
  param('baggageId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Baggage ID must be a positive integer'),
    
  param('trackingNo')
    .optional()
    .matches(/^[A-Z0-9]{10,20}$/)
    .withMessage('Tracking number must be 10-20 uppercase alphanumeric characters'),
    
  body('status')
    .isIn(['checked_in', 'in_transit', 'arrived', 'delivered', 'lost'])
    .withMessage('Status must be one of: checked_in, in_transit, arrived, delivered, lost'),
    
  handleValidationErrors
];

export const validateBaggageTracking = [
  param('trackingNo')
    .matches(/^[A-Z0-9]{10,20}$/)
    .withMessage('Tracking number must be 10-20 uppercase alphanumeric characters'),
    
  handleValidationErrors
];

export const validateBaggageSearch = [
  query('tracking_no')
    .optional()
    .matches(/^[A-Z0-9]{10,20}$/)
    .withMessage('Tracking number must be 10-20 uppercase alphanumeric characters'),
    
  query('passenger_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Passenger ID must be a positive integer'),
    
  query('flight_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Flight ID must be a positive integer'),
    
  query('status')
    .optional()
    .isIn(['checked_in', 'in_transit', 'arrived', 'delivered', 'lost'])
    .withMessage('Status must be one of: checked_in, in_transit, arrived, delivered, lost'),
    
  handleValidationErrors
];

export const validateReportDateRange = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date (YYYY-MM-DD)'),
    
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date (YYYY-MM-DD)')
    .custom((value, { req }) => {
      if (req.query && req.query.startDate && value) {
        const startDate = new Date(req.query.startDate as string);
        const endDate = new Date(value);
        
        if (endDate < startDate) {
          throw new Error('End date must be after start date');
        }
      }
      return true;
    }),
    
  query('days')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Days must be between 1 and 365'),
    
  handleValidationErrors
];

export const validateReportExport = [
  query('type')
    .isIn(['metrics', 'bookings', 'flights', 'revenue', 'passengers'])
    .withMessage('Report type must be one of: metrics, bookings, flights, revenue, passengers'),
    
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date (YYYY-MM-DD)'),
    
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date (YYYY-MM-DD)'),
    
  handleValidationErrors
];

export const validateAirportCreation = [
  body('city_name')
    .notEmpty()
    .withMessage('City name is required')
    .isLength({ max: 100 })
    .withMessage('City name must be less than 100 characters'),
    
  body('airport_name')
    .notEmpty()
    .withMessage('Airport name is required')
    .isLength({ max: 200 })
    .withMessage('Airport name must be less than 200 characters'),
    
  body('iata_code')
    .notEmpty()
    .withMessage('IATA code is required')
    .matches(/^[A-Z]{3}$/)
    .withMessage('IATA code must be exactly 3 uppercase letters'),
    
  body('country_name')
    .notEmpty()
    .withMessage('Country name is required')
    .isLength({ max: 100 })
    .withMessage('Country name must be less than 100 characters'),
    
  handleValidationErrors
];

export const validateAirportUpdate = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Airport ID must be a positive integer'),
    
  body('city_name')
    .optional()
    .notEmpty()
    .withMessage('City name cannot be empty')
    .isLength({ max: 100 })
    .withMessage('City name must be less than 100 characters'),
    
  body('airport_name')
    .optional()
    .notEmpty()
    .withMessage('Airport name cannot be empty')
    .isLength({ max: 200 })
    .withMessage('Airport name must be less than 200 characters'),
    
  body('iata_code')
    .optional()
    .notEmpty()
    .withMessage('IATA code cannot be empty')
    .matches(/^[A-Z]{3}$/)
    .withMessage('IATA code must be exactly 3 uppercase letters'),
    
  body('country_name')
    .optional()
    .notEmpty()
    .withMessage('Country name cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Country name must be less than 100 characters'),
    
  handleValidationErrors
];

export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
    
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
    
  handleValidationErrors
];
