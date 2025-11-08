import express from 'express';
import passengersController from '../controllers/passengersController';
import { authenticateToken } from '../middleware/auth';
import { validatePassengerCreation, validatePassengerUpdate, validateIdParam } from '../middleware/validation';

const router = express.Router();

// All passenger routes require authentication
router.use(authenticateToken);

// Get passenger details
router.get('/:passengerId', validateIdParam('passengerId'), passengersController.getPassengerDetails);

// Update passenger information
router.put('/:passengerId', validatePassengerUpdate, passengersController.updatePassenger);

// Change passenger seat
router.patch('/:passengerId/seat', validateIdParam('passengerId'), passengersController.changeSeat);

// Add passenger to existing booking
router.post('/booking/:bookingId', validatePassengerCreation, passengersController.addPassengerToBooking);

// Remove passenger from booking
router.delete('/:passengerId', validateIdParam('passengerId'), passengersController.removePassengerFromBooking);

// Get passengers by booking
router.get('/booking/:bookingId/passengers', validateIdParam('bookingId'), passengersController.getPassengersByBooking);

export default router;