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

router.use(sanitizeInput);

router.get('/track/:trackingNo', validateBaggageTracking, baggageController.trackBaggage.bind(baggageController));

router.use(authenticateToken);

router.get('/passenger/:passengerId', validateIdParam('passengerId'), baggageController.getBaggageByPassenger.bind(baggageController));

router.get('/:baggageId', validateIdParam('baggageId'), baggageController.getBaggageDetails.bind(baggageController));

router.use(requireAdmin);

router.get('/search', validateBaggageSearch, baggageController.searchBaggage.bind(baggageController));

router.get('/stats', baggageController.getBaggageStats.bind(baggageController));

router.get('/reports/lost', baggageController.getLostBaggageReport.bind(baggageController));

router.get('/status/:status', baggageController.getBaggageByStatus.bind(baggageController));

router.get('/flight/:flightId', validateIdParam('flightId'), baggageController.getBaggageByFlight.bind(baggageController));

router.post('/', validateBaggageCreation, baggageController.createBaggage.bind(baggageController));

router.put('/track/:trackingNo/status', validateBaggageStatusUpdate, baggageController.updateBaggageStatusByTracking.bind(baggageController));

router.put('/:baggageId/status', validateBaggageStatusUpdate, baggageController.updateBaggageStatus.bind(baggageController));

router.delete('/:baggageId', validateIdParam('baggageId'), baggageController.deleteBaggage.bind(baggageController));

export default router;
