import express from 'express';
import { 
  getAllFlights,
  createFlight,
  updateFlight,
  deleteFlight,
  updateFlightStatus,
  getFlightStats,
  getAllAirplanes,
  getAirplaneDetails,
  createAirplane,
  updateAirplane,
  deleteAirplane,
  getAirplaneSeatConfiguration,
  createSeat,
  updateSeat,
  deleteSeat
} from '../controllers/flightsController';
import {
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  deleteBooking,
  getAllPassengers,
  getPassengerById,
  updatePassenger,
  getFlightPassengers,
  getAllPayments,
  getPaymentById,
  processRefund,
  updatePaymentStatus,
  getAllAirports,
  createAirport,
  updateAirport,
  deleteAirport,
  getAllClients,
  getClientById,
  updateClientStatus,
  getAllBaggage,
  getBaggageById,
  updateBaggageStatus,
  getFlightBaggage
} from '../controllers/adminController';
import { 
  validateFlightCreation,
  validateFlightUpdate,
  validateFlightStatusUpdate,
  validateAirplaneCreation,
  validateAirplaneUpdate,
  validateSeatCreation,
  validateSeatUpdate,
  validateIdParam,
  sanitizeInput 
} from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';
import { requireAdmin } from '../middleware/adminAuth';

const router = express.Router();

router.use(authenticateToken);
router.use(requireAdmin);
router.use(sanitizeInput);


router.get('/flights/stats', getFlightStats);

router.get('/flights', getAllFlights);

router.post('/flights', validateFlightCreation, createFlight);

router.put('/flights/:id', validateFlightUpdate, updateFlight);

router.patch('/flights/:id/status', validateFlightStatusUpdate, updateFlightStatus);

router.delete('/flights/:id', validateIdParam('id'), deleteFlight);


router.get('/airplanes', getAllAirplanes);

router.get('/airplanes/:id', validateIdParam('id'), getAirplaneDetails);

router.post('/airplanes', validateAirplaneCreation, createAirplane);

router.put('/airplanes/:id', validateAirplaneUpdate, updateAirplane);

router.delete('/airplanes/:id', validateIdParam('id'), deleteAirplane);


router.get('/airplanes/:id/seats', validateIdParam('id'), getAirplaneSeatConfiguration);

router.post('/airplanes/:id/seats', validateSeatCreation, createSeat);

router.put('/seats/:seatId', validateSeatUpdate, updateSeat);

router.delete('/seats/:seatId', validateIdParam('seatId'), deleteSeat);


router.get('/bookings', getAllBookings);

router.get('/bookings/:id', validateIdParam('id'), getBookingById);

router.patch('/bookings/:id/status', validateIdParam('id'), updateBookingStatus);

router.delete('/bookings/:id', validateIdParam('id'), deleteBooking);


router.get('/passengers', getAllPassengers);

router.get('/passengers/:id', validateIdParam('id'), getPassengerById);

router.put('/passengers/:id', validateIdParam('id'), updatePassenger);

router.get('/flights/:flightId/passengers', validateIdParam('flightId'), getFlightPassengers);


router.get('/payments', getAllPayments);

router.get('/payments/:id', validateIdParam('id'), getPaymentById);

router.post('/payments/:id/refund', validateIdParam('id'), processRefund);

router.patch('/payments/:id/status', validateIdParam('id'), updatePaymentStatus);


router.get('/airports', getAllAirports);

router.post('/airports', createAirport);

router.put('/airports/:id', validateIdParam('id'), updateAirport);

router.delete('/airports/:id', validateIdParam('id'), deleteAirport);


router.get('/clients', getAllClients);

router.get('/clients/:id', validateIdParam('id'), getClientById);

router.patch('/clients/:id/status', validateIdParam('id'), updateClientStatus);


router.get('/baggage', getAllBaggage);

router.get('/baggage/:id', validateIdParam('id'), getBaggageById);

router.patch('/baggage/:id/status', validateIdParam('id'), updateBaggageStatus);

router.get('/flights/:flightId/baggage', validateIdParam('flightId'), getFlightBaggage);

export default router;