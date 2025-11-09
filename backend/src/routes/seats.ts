import express from 'express';
import { 
  getFlightSeats, 
  checkSeatAvailability 
} from '../controllers/flightsController';
import { 
  validateIdParam,
  validateSeatAvailabilityCheck,
  sanitizeInput 
} from '../middleware/validation';

const router = express.Router();

// Apply input sanitization to all routes
router.use(sanitizeInput);

/**
 * @route GET /api/v1/seats/flight/:id
 * @desc Get available seats for a flight
 * @access Public
 * @param id - Flight ID
 * @query class - Seat class filter (optional)
 */
router.get('/flight/:id', validateIdParam('id'), getFlightSeats);

/**
 * @route POST /api/v1/seats/flight/:id/check
 * @desc Check availability of specific seats
 * @access Public
 * @param id - Flight ID
 * @body seat_ids - Array of seat IDs to check
 */
router.post('/flight/:id/check', validateIdParam('id'), validateSeatAvailabilityCheck, checkSeatAvailability);

export default router;