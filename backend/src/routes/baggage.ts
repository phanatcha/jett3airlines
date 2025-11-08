import express from 'express';
import baggageController from '../controllers/baggageController';
import { authenticateToken } from '../middleware/auth';
import { requireAdmin } from '../middleware/adminAuth';
import {
  validateBaggageCreation,
  validateBaggageStatusUpdate,
  validateBaggageTracking,
  validateBaggageSearch,
  validateIdParam,
  sanitizeInput
} from '../middleware/validation';

const router = express.Router();

// Apply input sanitization to all routes
router.use(sanitizeInput);

/**
 * @route GET /api/v1/baggage/track/:trackingNo
 * @desc Track baggage by tracking number (public endpoint)
 * @access Public
 * @param trackingNo - Baggage tracking number
 */
router.get('/track/:trackingNo', validateBaggageTracking, baggageController.trackBaggage.bind(baggageController));

// Authenticated endpoints - require user authentication
router.use(authenticateToken);

/**
 * @route GET /api/v1/baggage/passenger/:passengerId
 * @desc Get baggage by passenger ID
 * @access Private
 * @param passengerId - Passenger ID
 */
router.get('/passenger/:passengerId', validateIdParam('passengerId'), baggageController.getBaggageByPassenger.bind(baggageController));

/**
 * @route GET /api/v1/baggage/:baggageId
 * @desc Get baggage details by ID
 * @access Private
 * @param baggageId - Baggage ID
 */
router.get('/:baggageId', validateIdParam('baggageId'), baggageController.getBaggageDetails.bind(baggageController));

// Admin endpoints - require admin authentication
router.use(requireAdmin);

/**
 * @route GET /api/v1/baggage/search
 * @desc Search baggage records
 * @access Admin
 * @query tracking_no - Search by tracking number (optional)
 * @query passenger_name - Search by passenger name (optional)
 * @query status - Filter by status (optional)
 */
router.get('/search', validateBaggageSearch, baggageController.searchBaggage.bind(baggageController));

/**
 * @route GET /api/v1/baggage/stats
 * @desc Get baggage statistics
 * @access Admin
 */
router.get('/stats', baggageController.getBaggageStats.bind(baggageController));

/**
 * @route GET /api/v1/baggage/reports/lost
 * @desc Get lost baggage report
 * @access Admin
 */
router.get('/reports/lost', baggageController.getLostBaggageReport.bind(baggageController));

/**
 * @route GET /api/v1/baggage/status/:status
 * @desc Get baggage by status
 * @access Admin
 * @param status - Baggage status
 */
router.get('/status/:status', baggageController.getBaggageByStatus.bind(baggageController));

/**
 * @route GET /api/v1/baggage/flight/:flightId
 * @desc Get baggage by flight ID
 * @access Admin
 * @param flightId - Flight ID
 */
router.get('/flight/:flightId', validateIdParam('flightId'), baggageController.getBaggageByFlight.bind(baggageController));

/**
 * @route POST /api/v1/baggage
 * @desc Create new baggage record
 * @access Admin
 * @body passenger_id - Passenger ID (required)
 * @body weight - Baggage weight (required)
 * @body status - Baggage status (optional, default: 'Checked In')
 */
router.post('/', validateBaggageCreation, baggageController.createBaggage.bind(baggageController));

/**
 * @route PUT /api/v1/baggage/track/:trackingNo/status
 * @desc Update baggage status by tracking number
 * @access Admin
 * @param trackingNo - Baggage tracking number
 * @body status - New baggage status (required)
 */
router.put('/track/:trackingNo/status', validateBaggageStatusUpdate, baggageController.updateBaggageStatusByTracking.bind(baggageController));

/**
 * @route PUT /api/v1/baggage/:baggageId/status
 * @desc Update baggage status by ID
 * @access Admin
 * @param baggageId - Baggage ID
 * @body status - New baggage status (required)
 */
router.put('/:baggageId/status', validateBaggageStatusUpdate, baggageController.updateBaggageStatus.bind(baggageController));

/**
 * @route DELETE /api/v1/baggage/:baggageId
 * @desc Delete baggage record
 * @access Admin
 * @param baggageId - Baggage ID
 */
router.delete('/:baggageId', validateIdParam('baggageId'), baggageController.deleteBaggage.bind(baggageController));

export default router;
