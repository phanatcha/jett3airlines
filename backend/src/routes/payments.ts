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

// All payment routes require authentication
router.use(authenticateToken);

// Apply input sanitization to all routes
router.use(sanitizeInput);

/**
 * @route GET /api/v1/payments/history
 * @desc Get payment history for authenticated client
 * @access Private
 * @query page - Page number (optional, default: 1)
 * @query limit - Items per page (optional, default: 10)
 */
router.get('/history', paymentsController.getPaymentHistory.bind(paymentsController));

/**
 * @route GET /api/v1/payments/booking/:bookingId
 * @desc Get payment status for a booking
 * @access Private
 * @param bookingId - Booking ID
 */
router.get('/booking/:bookingId', validateIdParam('bookingId'), paymentsController.getPaymentStatus.bind(paymentsController));

/**
 * @route GET /api/v1/payments/receipt/:paymentId
 * @desc Get payment receipt
 * @access Private
 * @param paymentId - Payment ID
 */
router.get('/receipt/:paymentId', validateIdParam('paymentId'), paymentsController.getPaymentReceipt.bind(paymentsController));

/**
 * @route POST /api/v1/payments
 * @desc Process payment for a booking
 * @access Private
 * @body booking_id - Booking ID (required)
 * @body amount - Payment amount (required)
 * @body payment_method - Payment method (required)
 * @body card_no - Card number (required if payment_method is card)
 * @body cvv - CVV (required if payment_method is card)
 * @body expiry_date - Expiry date (required if payment_method is card)
 */
router.post('/', validatePaymentProcessing, paymentsController.processPayment.bind(paymentsController));

/**
 * @route POST /api/v1/payments/refund/:bookingId
 * @desc Process refund for a booking
 * @access Private
 * @param bookingId - Booking ID
 * @body reason - Refund reason (optional)
 */
router.post('/refund/:bookingId', validateRefundProcessing, paymentsController.processRefund.bind(paymentsController));

export default router;