import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult, ValidationChain } from 'express-validator';

/**
 * Middleware to handle validation errors
 */
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.type === 'field' ? error.path : 'unknown',
      message: error.msg,
      value: error.type === 'field' ? error.value : undefined
    }));

    res.status(422).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: formattedErrors
      }
    });
    return;
  }
  
  next();
};

/**
 * Common validation rules for authentication
 */
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

/**
 * Validation for password change
 */
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

/**
 * Generic ID parameter validation
 */
export const validateIdParam = (paramName: string = 'id'): ValidationChain[] => [
  param(paramName)
    .isInt({ min: 1 })
    .withMessage(`${paramName} must be a positive integer`)
];

/**
 * Sanitize input to prevent XSS
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction): void => {
  // Basic XSS prevention - remove script tags and javascript: protocols
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

  req.body = sanitizeValue(req.body);
  req.query = sanitizeValue(req.query);
  req.params = sanitizeValue(req.params);
  
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

/**
 * Validation for seat availability check
 */
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

/**
 * Validation for flight creation (admin)
 */
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

/**
 * Validation for flight update (admin)
 */
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

/**
 * Validation for airplane update (admin)
 */
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

/**
 * Validation for seat creation (admin)
 */
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

/**
 * Validation for seat update (admin)
 */
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

/**
 * Validation for booking creation
 */
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
    .optional()
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage('Phone number format is invalid'),
    
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

/**
 * Validation for booking update
 */
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

/**
 * Validation for passenger creation
 */
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

/**
 * Validation for passenger update
 */
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