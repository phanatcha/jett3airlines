import express from 'express';
import { 
  searchFlights, 
  getFlightDetails, 
  getFlightSeats, 
  checkSeatAvailability 
} from '../controllers/flightsController';
import { 
  validateFlightSearch, 
  validateIdParam, 
  validateSeatAvailabilityCheck,
  sanitizeInput 
} from '../middleware/validation';

const router = express.Router();

// Apply input sanitization to all routes
router.use(sanitizeInput);

/**
 * @route GET /api/v1/flights/search
 * @desc Search flights by criteria
 * @access Public
 * @query depart_airport_id - Departure airport ID (required)
 * @query arrive_airport_id - Arrival airport ID (required)  
 * @query depart_date - Departure date in YYYY-MM-DD format (required)
 * @query passengers - Number of passengers (optional, default: 1)
 * @query class - Seat class filter (optional)
 */
router.get('/search', validateFlightSearch, searchFlights);

/**
 * @route GET /api/v1/flights/:id
 * @desc Get flight details by ID
 * @access Public
 * @param id - Flight ID
 */
router.get('/:id', validateIdParam('id'), getFlightDetails);

/**
 * @route GET /api/v1/flights/:id/seats
 * @desc Get available seats for a flight
 * @access Public
 * @param id - Flight ID
 * @query class - Seat class filter (optional)
 */
router.get('/:id/seats', validateIdParam('id'), getFlightSeats);

/**
 * @route POST /api/v1/flights/:id/seats/check
 * @desc Check availability of specific seats
 * @access Public
 * @param id - Flight ID
 * @body seat_ids - Array of seat IDs to check
 */
router.post('/:id/seats/check', validateSeatAvailabilityCheck, checkSeatAvailability);

export default router;