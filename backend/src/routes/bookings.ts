import express from 'express';
import bookingsController from '../controllers/bookingsController';
import { authenticateToken } from '../middleware/auth';
import { validateBookingCreation, validateBookingUpdate } from '../middleware/validation';

const router = express.Router();

// All booking routes require authentication
router.use(authenticateToken);

// Create new booking
router.post('/', validateBookingCreation, bookingsController.createBooking);

// Get booking history for authenticated client
router.get('/', bookingsController.getBookingHistory);

// Get specific booking details
router.get('/:bookingId', bookingsController.getBookingDetails);

// Update booking
router.put('/:bookingId', validateBookingUpdate, bookingsController.updateBooking);

// Update booking status (admin only)
router.patch('/:id/status', bookingsController.updateBookingStatus);

// Cancel booking
router.delete('/:bookingId', bookingsController.cancelBooking);

export default router;