import express from 'express';
import { getAirports } from '../controllers/airportsController';
import { sanitizeInput } from '../middleware/validation';

const router = express.Router();

router.use(sanitizeInput);

router.get('/', getAirports);

export default router;
