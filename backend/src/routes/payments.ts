import express from 'express';
import paymentsController from '../controllers/paymentsController';
import { authenticateToken } from '../middleware/auth';
import { 
  validatePaymentProcessing, 
  validateRefundProcessing,
  validateIdParam,
  sanitizeInput 
} from '../middleware/validation';

const router = express.Router();

router.use(authenticateToken);

router.use(sanitizeInput);

router.get('/history', paymentsController.getPaymentHistory.bind(paymentsController));

router.get('/booking/:bookingId', validateIdParam('bookingId'), paymentsController.getPaymentStatus.bind(paymentsController));

router.get('/receipt/:paymentId', validateIdParam('paymentId'), paymentsController.getPaymentReceipt.bind(paymentsController));

router.post('/', validatePaymentProcessing, paymentsController.processPayment.bind(paymentsController));

router.post('/refund/:bookingId', validateRefundProcessing, paymentsController.processRefund.bind(paymentsController));

export default router;