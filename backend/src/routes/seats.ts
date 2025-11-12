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

router.use(sanitizeInput);

router.get('/flight/:id', validateIdParam('id'), getFlightSeats);

router.post('/flight/:id/check', validateIdParam('id'), validateSeatAvailabilityCheck, checkSeatAvailability);

export default router;