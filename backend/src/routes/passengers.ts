import express from 'express';
import passengersController from '../controllers/passengersController';
import { authenticateToken } from '../middleware/auth';
import { validatePassengerCreation, validatePassengerUpdate, validateIdParam, sanitizeInput } from '../middleware/validation';

const router = express.Router();

// All passenger routes require authentication
router.use(authenticateToken);

// Apply input sanitization to all routes
router.use(sanitizeInput);

/**
 * @route GET /api/v1/passengers/booking/:bookingId/passengers
 * @desc Get all passengers for a specific booking
 * @access Private
 * @param bookingId - Booking ID
 */
router.get('/booking/:bookingId/passengers', validateIdParam('bookingId'), passengersController.getPassengersByBooking);

/**
 * @route POST /api/v1/passengers/booking/:bookingId
 * @desc Add passenger to existing booking
 * @access Private
 * @param bookingId - Booking ID
 * @body firstname - Passenger first name (required)
 * @body lastname - Passenger last name (required)
 * @body dob - Date of birth (required)
 * @body nationality - Nationality (required)
 * @body passport_no - Passport number (required)
 * @body seat_id - Seat ID (required)
 */
router.post('/booking/:bookingId', validatePassengerCreation, passengersController.addPassengerToBooking);

/**
 * @route GET /api/v1/passengers/:passengerId
 * @desc Get passenger details
 * @access Private
 * @param passengerId - Passenger ID
 */
router.get('/:passengerId', validateIdParam('passengerId'), passengersController.getPassengerDetails);

/**
 * @route PUT /api/v1/passengers/:passengerId
 * @desc Update passenger information
 * @access Private
 * @param passengerId - Passenger ID
 * @body Any passenger fields to update
 */
router.put('/:passengerId', validatePassengerUpdate, passengersController.updatePassenger);

/**
 * @route PATCH /api/v1/passengers/:passengerId/seat
 * @desc Change passenger seat assignment
 * @access Private
 * @param passengerId - Passenger ID
 * @body seat_id - New seat ID (required)
 */
router.patch('/:passengerId/seat', validateIdParam('passengerId'), passengersController.changeSeat);

/**
 * @route DELETE /api/v1/passengers/:passengerId
 * @desc Remove passenger from booking
 * @access Private
 * @param passengerId - Passenger ID
 */
router.delete('/:passengerId', validateIdParam('passengerId'), passengersController.removePassengerFromBooking);

export default router;