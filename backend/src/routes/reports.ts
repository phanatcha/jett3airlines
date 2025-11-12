import express from 'express';
import { ReportsController } from '../controllers/reportsController';
import { authenticateToken } from '../middleware/auth';
import { requireAdmin } from '../middleware/adminAuth';
import { 
  sanitizeInput,
  validateReportDateRange,
  validateReportExport
} from '../middleware/validation';

const router = express.Router();
const reportsController = new ReportsController();

router.use(authenticateToken);
router.use(requireAdmin);
router.use(sanitizeInput);

router.get('/metrics', reportsController.getMetrics);

router.get('/bookings-per-day', validateReportDateRange, reportsController.getBookingsPerDay);

router.get('/revenue-per-day', validateReportDateRange, reportsController.getRevenuePerDay);

router.get('/flight-stats', reportsController.getFlightStats);

router.get('/booking-stats', reportsController.getBookingStats);

router.get('/export/csv', validateReportExport, reportsController.exportCSV);

router.get('/export/pdf', validateReportExport, reportsController.exportPDF);

export default router;
