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

router.use(sanitizeInput);

router.get('/search', validateFlightSearch, searchFlights);

router.get('/:id', validateIdParam('id'), getFlightDetails);

router.get('/:id/seats', validateIdParam('id'), getFlightSeats);

router.post('/:id/seats/check', validateIdParam('id'), validateSeatAvailabilityCheck, checkSeatAvailability);

export default router;