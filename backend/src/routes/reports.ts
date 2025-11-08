import express from 'express';
import { ReportsController } from '../controllers/reportsController';
import { authenticateToken } from '../middleware/auth';
import { requireAdmin } from '../middleware/adminAuth';
import { sanitizeInput } from '../middleware/validation';

const router = express.Router();
const reportsController = new ReportsController();

// Apply authentication, admin check, and input sanitization to all reports routes
router.use(authenticateToken);
router.use(requireAdmin);
router.use(sanitizeInput);

/**
 * @route GET /api/v1/admin/reports/metrics
 * @desc Get summary metrics (total flights, bookings, revenue, cancellations)
 * @access Admin
 */
router.get('/metrics', reportsController.getMetrics);

/**
 * @route GET /api/v1/admin/reports/bookings-per-day
 * @desc Get bookings per day data for charts
 * @access Admin
 * @query startDate - Start date (optional, format: YYYY-MM-DD)
 * @query endDate - End date (optional, format: YYYY-MM-DD)
 * @query days - Number of days to look back (optional, default: 30)
 */
router.get('/bookings-per-day', reportsController.getBookingsPerDay);

/**
 * @route GET /api/v1/admin/reports/revenue-per-day
 * @desc Get revenue per day data for charts
 * @access Admin
 * @query startDate - Start date (optional, format: YYYY-MM-DD)
 * @query endDate - End date (optional, format: YYYY-MM-DD)
 * @query days - Number of days to look back (optional, default: 30)
 */
router.get('/revenue-per-day', reportsController.getRevenuePerDay);

/**
 * @route GET /api/v1/admin/reports/flight-stats
 * @desc Get flight statistics
 * @access Admin
 */
router.get('/flight-stats', reportsController.getFlightStats);

/**
 * @route GET /api/v1/admin/reports/booking-stats
 * @desc Get booking statistics
 * @access Admin
 */
router.get('/booking-stats', reportsController.getBookingStats);

/**
 * @route GET /api/v1/admin/reports/export/csv
 * @desc Export reports as CSV
 * @access Admin
 * @query type - Report type (metrics, bookings, flights)
 * @query startDate - Start date (optional)
 * @query endDate - End date (optional)
 */
router.get('/export/csv', reportsController.exportCSV);

/**
 * @route GET /api/v1/admin/reports/export/pdf
 * @desc Export reports as PDF
 * @access Admin
 * @query type - Report type (metrics, bookings, flights)
 * @query startDate - Start date (optional)
 * @query endDate - End date (optional)
 */
router.get('/export/pdf', reportsController.exportPDF);

export default router;
