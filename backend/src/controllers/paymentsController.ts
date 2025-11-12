import { Response } from 'express';
import { PaymentModel } from '../models/Payment';
import { BookingModel } from '../models/Booking';
import { PaymentRequest, PaymentStatus } from '../types/database';
import { AuthenticatedRequest } from '../middleware/auth';

const paymentModel = new PaymentModel();
const bookingModel = new BookingModel();

export class PaymentsController {
  async processPayment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const clientId = req.user?.client_id;
      if (!clientId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          }
        });
        return;
      }

      const paymentData: PaymentRequest = req.body;

      const validationErrors = paymentModel.validatePaymentData(
        paymentData.amount,
        paymentData.currency || 'USD',
        paymentData.booking_id
      );

      if (validationErrors.length > 0) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid payment data',
            details: validationErrors
          }
        });
        return;
      }

      const booking = await bookingModel.findBookingById(paymentData.booking_id);
      if (!booking) {
        res.status(404).json({
          success: false,
          error: {
            code: 'BOOKING_NOT_FOUND',
            message: 'Booking not found'
          }
        });
        return;
      }

      if (booking.client_id !== clientId) {
        res.status(403).json({
          success: false,
          error: {
            code: 'ACCESS_DENIED',
            message: 'Access denied to this booking'
          }
        });
        return;
      }

      if (booking.status !== 'pending') {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_BOOKING_STATUS',
            message: `Booking is already ${booking.status}. Only pending bookings can be paid.`
          }
        });
        return;
      }

      const existingPayment = await paymentModel.findPaymentByBookingId(paymentData.booking_id);
      if (existingPayment && existingPayment.status === PaymentStatus.COMPLETED) {
        res.status(409).json({
          success: false,
          error: {
            code: 'PAYMENT_ALREADY_EXISTS',
            message: 'Payment has already been completed for this booking'
          }
        });
        return;
      }

      const isValidAmount = await paymentModel.validatePaymentAmount(
        paymentData.booking_id,
        paymentData.amount
      );

      if (!isValidAmount) {
        const actualCost = await bookingModel.calculateBookingCost(paymentData.booking_id);
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_PAYMENT_AMOUNT',
            message: 'Payment amount does not match booking cost',
            details: {
              providedAmount: paymentData.amount,
              expectedAmount: actualCost
            }
          }
        });
        return;
      }

      const paymentId = await paymentModel.processPayment(
        paymentData.booking_id,
        paymentData.amount,
        paymentData.currency || 'USD'
      );

      const receipt = await paymentModel.getPaymentReceipt(paymentId);

      res.status(201).json({
        success: true,
        data: {
          payment_id: paymentId,
          receipt: receipt
        },
        message: 'Payment processed successfully'
      });

    } catch (error) {
      console.error('Error processing payment:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'PAYMENT_PROCESSING_ERROR',
          message: 'Failed to process payment'
        }
      });
    }
  }

  async getPaymentStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const clientId = req.user?.client_id;
      const bookingId = parseInt(req.params.bookingId);

      if (!clientId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          }
        });
        return;
      }

      if (!bookingId || bookingId <= 0) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_BOOKING_ID',
            message: 'Valid booking ID is required'
          }
        });
        return;
      }

      const booking = await bookingModel.findBookingById(bookingId);
      if (!booking) {
        res.status(404).json({
          success: false,
          error: {
            code: 'BOOKING_NOT_FOUND',
            message: 'Booking not found'
          }
        });
        return;
      }

      if (booking.client_id !== clientId) {
        res.status(403).json({
          success: false,
          error: {
            code: 'ACCESS_DENIED',
            message: 'Access denied to this booking'
          }
        });
        return;
      }

      const payment = await paymentModel.findPaymentByBookingId(bookingId);

      if (!payment) {
        res.json({
          success: true,
          data: {
            booking_id: bookingId,
            payment_status: 'not_paid',
            message: 'No payment found for this booking'
          },
          message: 'Payment status retrieved successfully'
        });
        return;
      }

      res.json({
        success: true,
        data: {
          payment,
          booking_status: booking.status
        },
        message: 'Payment status retrieved successfully'
      });

    } catch (error) {
      console.error('Error getting payment status:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve payment status'
        }
      });
    }
  }

  async getPaymentReceipt(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const clientId = req.user?.client_id;
      const paymentId = parseInt(req.params.paymentId);

      if (!clientId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          }
        });
        return;
      }

      if (!paymentId || paymentId <= 0) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_PAYMENT_ID',
            message: 'Valid payment ID is required'
          }
        });
        return;
      }

      const receipt = await paymentModel.getPaymentReceipt(paymentId);

      if (!receipt) {
        res.status(404).json({
          success: false,
          error: {
            code: 'PAYMENT_NOT_FOUND',
            message: 'Payment not found'
          }
        });
        return;
      }

      const booking = await bookingModel.findBookingById((receipt as any).booking_id);
      if (!booking || booking.client_id !== clientId) {
        res.status(403).json({
          success: false,
          error: {
            code: 'ACCESS_DENIED',
            message: 'Access denied to this payment'
          }
        });
        return;
      }

      res.json({
        success: true,
        data: receipt,
        message: 'Payment receipt retrieved successfully'
      });

    } catch (error) {
      console.error('Error getting payment receipt:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve payment receipt'
        }
      });
    }
  }

  async processRefund(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const clientId = req.user?.client_id;
      const bookingId = parseInt(req.params.bookingId);

      if (!clientId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          }
        });
        return;
      }

      if (!bookingId || bookingId <= 0) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_BOOKING_ID',
            message: 'Valid booking ID is required'
          }
        });
        return;
      }

      const booking = await bookingModel.findBookingById(bookingId);
      if (!booking) {
        res.status(404).json({
          success: false,
          error: {
            code: 'BOOKING_NOT_FOUND',
            message: 'Booking not found'
          }
        });
        return;
      }

      if (booking.client_id !== clientId) {
        res.status(403).json({
          success: false,
          error: {
            code: 'ACCESS_DENIED',
            message: 'Access denied to this booking'
          }
        });
        return;
      }

      if (booking.status === 'cancelled') {
        res.status(400).json({
          success: false,
          error: {
            code: 'ALREADY_CANCELLED',
            message: 'Booking is already cancelled'
          }
        });
        return;
      }

      if (booking.status !== 'confirmed') {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_BOOKING_STATUS',
            message: 'Only confirmed bookings can be refunded'
          }
        });
        return;
      }

      const payment = await paymentModel.findPaymentByBookingId(bookingId);
      if (!payment || payment.status !== PaymentStatus.COMPLETED) {
        res.status(400).json({
          success: false,
          error: {
            code: 'NO_PAYMENT_FOUND',
            message: 'No completed payment found for this booking'
          }
        });
        return;
      }

      const canModify = await bookingModel.canModifyBooking(bookingId, clientId);
      if (!canModify) {
        res.status(403).json({
          success: false,
          error: {
            code: 'REFUND_NOT_ALLOWED',
            message: 'Booking is outside the cancellation window (24 hours before departure)'
          }
        });
        return;
      }

      const refundId = await paymentModel.processRefund(bookingId);

      const refundReceipt = await paymentModel.getPaymentReceipt(refundId);

      res.json({
        success: true,
        data: {
          refund_id: refundId,
          refund_receipt: refundReceipt
        },
        message: 'Refund processed successfully'
      });

    } catch (error) {
      console.error('Error processing refund:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'REFUND_PROCESSING_ERROR',
          message: 'Failed to process refund'
        }
      });
    }
  }

  async getPaymentHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const clientId = req.user?.client_id;

      if (!clientId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          }
        });
        return;
      }

      const bookings = await bookingModel.getBookingsByClient(clientId);
      
      const paymentsPromises = bookings.map(async (booking: any) => {
        const payments = await paymentModel.getPaymentsByBookingId(booking.booking_id);
        return {
          booking_id: booking.booking_id,
          booking_no: booking.booking_no,
          flight_info: {
            departure: booking.departure_airport,
            arrival: booking.arrival_airport,
            depart_when: booking.depart_when
          },
          payments: payments
        };
      });

      const paymentHistory = await Promise.all(paymentsPromises);

      res.json({
        success: true,
        data: paymentHistory,
        message: 'Payment history retrieved successfully'
      });

    } catch (error) {
      console.error('Error getting payment history:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve payment history'
        }
      });
    }
  }
}

export default new PaymentsController();
