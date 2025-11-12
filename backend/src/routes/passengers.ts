import express from 'express';
import passengersController from '../controllers/passengersController';
import { authenticateToken } from '../middleware/auth';
import { validatePassengerCreation, validatePassengerUpdate, validateIdParam, sanitizeInput } from '../middleware/validation';

const router = express.Router();

router.use(authenticateToken);

router.use(sanitizeInput);

router.get('/booking/:bookingId/passengers', validateIdParam('bookingId'), passengersController.getPassengersByBooking);

router.post('/booking/:bookingId', validatePassengerCreation, passengersController.addPassengerToBooking);

router.get('/:passengerId', validateIdParam('passengerId'), passengersController.getPassengerDetails);

router.put('/:passengerId', validatePassengerUpdate, passengersController.updatePassenger);

router.patch('/:passengerId/seat', validateIdParam('passengerId'), passengersController.changeSeat);

router.delete('/:passengerId', validateIdParam('passengerId'), passengersController.removePassengerFromBooking);

export default router;