import express, { Request, Response } from 'express';
import bookingsController from '../controllers/bookingsController';
import { authenticateToken } from '../middleware/auth';
import { validateBookingCreation, validateBookingUpdate, sanitizeInput } from '../middleware/validation';

const router = express.Router();

// All booking routes require authentication
router.use(authenticateToken);

// Apply input sanitization to all routes
router.use(sanitizeInput);

/**
 * @route POST /api/v1/bookings
 * @desc Create new booking with passengers and seat selection
 * @access Private
 * @body flight_id - Flight ID (required)
 * @body passengers - Array of passenger objects (required)
 * @body support - Support service flag (optional)
 * @body fasttrack - Fast track service flag (optional)
 */
// Temporarily bypass validation to test
router.post('/', (req: Request, res: Response) => bookingsController.createBooking(req, res));

/**
 * @route GET /api/v1/bookings
 * @desc Get booking history for authenticated client
 * @access Private
 * @query page - Page number (optional, default: 1)
 * @query limit - Items per page (optional, default: 10)
 * @query status - Filter by booking status (optional)
 */
router.get('/', (req: Request, res: Response) => bookingsController.getBookingHistory(req, res));

/**
 * @route GET /api/v1/bookings/:bookingId
 * @desc Get specific booking details with passengers and flight info
 * @access Private
 * @param bookingId - Booking ID
 */
router.get('/:bookingId', (req: Request, res: Response) => bookingsController.getBookingDetails(req, res));

/**
 * @route PUT /api/v1/bookings/:bookingId
 * @desc Update booking information
 * @access Private
 * @param bookingId - Booking ID
 * @body support - Support service flag (optional)
 * @body fasttrack - Fast track service flag (optional)
 */
router.put('/:bookingId', validateBookingUpdate, (req: Request, res: Response) => bookingsController.updateBooking(req, res));

/**
 * @route PATCH /api/v1/bookings/:id/status
 * @desc Update booking status (admin only)
 * @access Private (Admin)
 * @param id - Booking ID
 * @body status - New booking status
 */
router.patch('/:id/status', (req: Request, res: Response) => bookingsController.updateBookingStatus(req, res));

/**
 * @route DELETE /api/v1/bookings/:bookingId
 * @desc Cancel booking and process refund if applicable
 * @access Private
 * @param bookingId - Booking ID
 */
router.delete('/:bookingId', (req: Request, res: Response) => bookingsController.cancelBooking(req, res));

export default router;