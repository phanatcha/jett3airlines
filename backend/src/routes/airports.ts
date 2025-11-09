import express from 'express';
import { getAirports } from '../controllers/airportsController';
import { sanitizeInput } from '../middleware/validation';

const router = express.Router();

// Apply input sanitization to all routes
router.use(sanitizeInput);

/**
 * @route GET /api/v1/airports
 * @desc Get all airports with optional filtering
 * @access Public
 * @query country - Filter by country name (optional)
 * @query search - Search by airport name, city, or IATA code (optional)
 */
router.get('/', getAirports);

export default router;
