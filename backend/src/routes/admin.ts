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

// Apply authentication, admin check, and input sanitization to all admin routes
router.use(authenticateToken);
router.use(requireAdmin);
router.use(sanitizeInput);

// ============= FLIGHT MANAGEMENT ROUTES =============

/**
 * @route GET /api/v1/admin/flights/stats
 * @desc Get flight statistics
 * @access Admin
 */
router.get('/flights/stats', getFlightStats);

/**
 * @route GET /api/v1/admin/flights
 * @desc Get all flights with pagination and filtering
 * @access Admin
 * @query page - Page number (optional, default: 1)
 * @query limit - Items per page (optional, default: 20)
 * @query status - Filter by flight status (optional)
 * @query airport_id - Filter by airport ID (optional)
 */
router.get('/flights', getAllFlights);

/**
 * @route POST /api/v1/admin/flights
 * @desc Create new flight
 * @access Admin
 * @body depart_when - Departure datetime (required)
 * @body arrive_when - Arrival datetime (required)
 * @body airplane_id - Airplane ID (required)
 * @body depart_airport_id - Departure airport ID (required)
 * @body arrive_airport_id - Arrival airport ID (required)
 * @body status - Flight status (optional, default: 'Scheduled')
 */
router.post('/flights', validateFlightCreation, createFlight);

/**
 * @route PUT /api/v1/admin/flights/:id
 * @desc Update flight information
 * @access Admin
 * @param id - Flight ID
 * @body Any flight fields to update
 */
router.put('/flights/:id', validateFlightUpdate, updateFlight);

/**
 * @route PATCH /api/v1/admin/flights/:id/status
 * @desc Update flight status
 * @access Admin
 * @param id - Flight ID
 * @body status - New flight status
 */
router.patch('/flights/:id/status', validateFlightStatusUpdate, updateFlightStatus);

/**
 * @route DELETE /api/v1/admin/flights/:id
 * @desc Delete flight
 * @access Admin
 * @param id - Flight ID
 */
router.delete('/flights/:id', validateIdParam('id'), deleteFlight);

// ============= AIRPLANE MANAGEMENT ROUTES =============

/**
 * @route GET /api/v1/admin/airplanes
 * @desc Get all airplanes with pagination and filtering
 * @access Admin
 * @query page - Page number (optional, default: 1)
 * @query limit - Items per page (optional, default: 20)
 * @query type - Filter by airplane type (optional)
 */
router.get('/airplanes', getAllAirplanes);

/**
 * @route GET /api/v1/admin/airplanes/:id
 * @desc Get airplane details
 * @access Admin
 * @param id - Airplane ID
 */
router.get('/airplanes/:id', validateIdParam('id'), getAirplaneDetails);

/**
 * @route POST /api/v1/admin/airplanes
 * @desc Create new airplane
 * @access Admin
 * @body type - Aircraft type (required)
 * @body registration - Registration number (required)
 * @body reg_country - Registration country (required)
 * @body MSN - Manufacturer Serial Number (required)
 * @body manufacturing_year - Manufacturing year (required)
 * @body capacity - Passenger capacity (required)
 * @body min_price - Minimum price (required)
 */
router.post('/airplanes', validateAirplaneCreation, createAirplane);

/**
 * @route PUT /api/v1/admin/airplanes/:id
 * @desc Update airplane information
 * @access Admin
 * @param id - Airplane ID
 * @body Any airplane fields to update
 */
router.put('/airplanes/:id', validateAirplaneUpdate, updateAirplane);

/**
 * @route DELETE /api/v1/admin/airplanes/:id
 * @desc Delete airplane
 * @access Admin
 * @param id - Airplane ID
 */
router.delete('/airplanes/:id', validateIdParam('id'), deleteAirplane);

// ============= SEAT CONFIGURATION MANAGEMENT ROUTES =============

/**
 * @route GET /api/v1/admin/airplanes/:id/seats
 * @desc Get airplane seat configuration
 * @access Admin
 * @param id - Airplane ID
 */
router.get('/airplanes/:id/seats', validateIdParam('id'), getAirplaneSeatConfiguration);

/**
 * @route POST /api/v1/admin/airplanes/:id/seats
 * @desc Create seat for airplane
 * @access Admin
 * @param id - Airplane ID
 * @body seat_no - Seat number (required)
 * @body class - Seat class (required)
 * @body price - Seat price (required)
 */
router.post('/airplanes/:id/seats', validateSeatCreation, createSeat);

/**
 * @route PUT /api/v1/admin/seats/:seatId
 * @desc Update seat information
 * @access Admin
 * @param seatId - Seat ID
 * @body Any seat fields to update
 */
router.put('/seats/:seatId', validateSeatUpdate, updateSeat);

/**
 * @route DELETE /api/v1/admin/seats/:seatId
 * @desc Delete seat
 * @access Admin
 * @param seatId - Seat ID
 */
router.delete('/seats/:seatId', validateIdParam('seatId'), deleteSeat);

export default router;