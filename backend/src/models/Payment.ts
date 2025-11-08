import { BaseModel } from './BaseModel';
import { Payment, CreatePayment, PaymentRequest, PaymentStatus } from '../types/database';

export class PaymentModel extends BaseModel {
  constructor() {
    super('payment');
  }

  // Find payment by ID
  async findPaymentById(paymentId: number): Promise<Payment | null> {
    return await super.findById<Payment>(paymentId, 'payment_id');
  }

  // Get payment with booking details
  async getPaymentDetails(paymentId: number) {
    try {
      const query = `
        SELECT 
          p.*,
          b.booking_id,
          b.status as booking_status,
          c.firstname as client_firstname,
          c.lastname as client_lastname,
          c.email as client_email,
          f.flight_id,
          dep_airport.iata_code as departure_iata,
          arr_airport.iata_code as arrival_iata,
          f.depart_when,
          f.arrive_when
        FROM payment p
        LEFT JOIN booking b ON p.booking_id = b.booking_id
        LEFT JOIN client c ON b.client_id = c.client_id
        LEFT JOIN flight f ON b.flight_id = f.flight_id
        LEFT JOIN airport dep_airport ON f.depart_airport_id = dep_airport.airport_id
        LEFT JOIN airport arr_airport ON f.arrive_airport_id = arr_airport.airport_id
        WHERE p.payment_id = ?
      `;
      
      const results = await this.executeQuery(query, [paymentId]);
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error('Error getting payment details:', error);
      throw error;
    }
  }

  // Get payments by booking ID
  async getPaymentsByBooking(bookingId: number) {
    try {
      const query = `
        SELECT * FROM payment 
        WHERE booking_id = ?
        ORDER BY payment_timestamp DESC
      `;

      return await this.executeQuery(query, [bookingId]);
    } catch (error) {
      console.error('Error getting payments by booking:', error);
      throw error;
    }
  }

  // Get payments by client ID
  async getPaymentsByClient(clientId: number, limit?: number, offset?: number) {
    try {
      let query = `
        SELECT 
          p.*,
          b.booking_id,
          f.flight_id,
          dep_airport.iata_code as departure_iata,
          arr_airport.iata_code as arrival_iata,
          f.depart_when
        FROM payment p
        LEFT JOIN booking b ON p.booking_id = b.booking_id
        LEFT JOIN flight f ON b.flight_id = f.flight_id
        LEFT JOIN airport dep_airport ON f.depart_airport_id = dep_airport.airport_id
        LEFT JOIN airport arr_airport ON f.arrive_airport_id = arr_airport.airport_id
        WHERE b.client_id = ?
        ORDER BY p.payment_timestamp DESC
      `;

      const params = [clientId];

      if (limit) {
        query += ' LIMIT ?';
        params.push(limit);
        
        if (offset) {
          query += ' OFFSET ?';
          params.push(offset);
        }
      }

      return await this.executeQuery(query, params);
    } catch (error) {
      console.error('Error getting payments by client:', error);
      throw error;
    }
  }

  // Process payment
  async processPayment(paymentData: PaymentRequest): Promise<number> {
    try {
      return await this.executeTransaction(async (connection) => {
        // Create payment record
        const createData: CreatePayment = {
          amount: paymentData.amount,
          currency: paymentData.currency,
          status: PaymentStatus.PENDING,
          booking_id: paymentData.booking_id
        };

        const paymentQuery = `
          INSERT INTO payment (amount, currency, payment_timestamp, status, booking_id)
          VALUES (?, ?, NOW(), ?, ?)
        `;

        const paymentResult = await connection.execute(paymentQuery, [
          createData.amount,
          createData.currency,
          createData.status,
          createData.booking_id
        ]);

        const paymentId = (paymentResult as any)[0].insertId;

        // Simulate payment processing (in real implementation, this would integrate with payment gateway)
        const paymentSuccess = await this.simulatePaymentProcessing(paymentData);

        if (paymentSuccess) {
          // Update payment status to completed
          const updatePaymentQuery = 'UPDATE payment SET status = ? WHERE payment_id = ?';
          await connection.execute(updatePaymentQuery, [PaymentStatus.COMPLETED, paymentId]);

          // Update booking status to confirmed
          const updateBookingQuery = 'UPDATE booking SET status = ? WHERE booking_id = ?';
          await connection.execute(updateBookingQuery, ['confirmed', paymentData.booking_id]);
        } else {
          // Update payment status to failed
          const updatePaymentQuery = 'UPDATE payment SET status = ? WHERE payment_id = ?';
          await connection.execute(updatePaymentQuery, [PaymentStatus.FAILED, paymentId]);
        }

        return paymentId;
      });
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  }

  // Update payment status
  async updatePaymentStatus(paymentId: number, status: PaymentStatus): Promise<boolean> {
    try {
      return await this.update<Payment>(paymentId, { status }, 'payment_id');
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  }

  // Process refund
  async processRefund(paymentId: number, refundAmount?: number): Promise<number> {
    try {
      return await this.executeTransaction(async (connection) => {
        // Get original payment details
        const originalPaymentQuery = 'SELECT * FROM payment WHERE payment_id = ?';
        const originalPaymentResult = await connection.execute(originalPaymentQuery, [paymentId]);
        
        if ((originalPaymentResult as any)[0].length === 0) {
          throw new Error('Original payment not found');
        }

        const originalPayment = (originalPaymentResult as any)[0][0];
        const refundAmountFinal = refundAmount || originalPayment.amount;

        // Create refund payment record
        const refundQuery = `
          INSERT INTO payment (amount, currency, payment_timestamp, status, booking_id)
          VALUES (?, ?, NOW(), ?, ?)
        `;

        const refundResult = await connection.execute(refundQuery, [
          -refundAmountFinal, // Negative amount for refund
          originalPayment.currency,
          PaymentStatus.COMPLETED,
          originalPayment.booking_id
        ]);

        const refundPaymentId = (refundResult as any)[0].insertId;

        // Update original payment status if full refund
        if (refundAmountFinal === originalPayment.amount) {
          const updateOriginalQuery = 'UPDATE payment SET status = ? WHERE payment_id = ?';
          await connection.execute(updateOriginalQuery, [PaymentStatus.REFUNDED, paymentId]);
        }

        return refundPaymentId;
      });
    } catch (error) {
      console.error('Error processing refund:', error);
      throw error;
    }
  }

  // Get payment summary for a booking
  async getBookingPaymentSummary(bookingId: number) {
    try {
      const query = `
        SELECT 
          SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as total_paid,
          SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) as total_refunded,
          SUM(amount) as net_amount,
          COUNT(CASE WHEN amount > 0 THEN 1 END) as payment_count,
          COUNT(CASE WHEN amount < 0 THEN 1 END) as refund_count,
          MAX(CASE WHEN amount > 0 THEN payment_timestamp END) as last_payment_date,
          MAX(CASE WHEN amount < 0 THEN payment_timestamp END) as last_refund_date
        FROM payment 
        WHERE booking_id = ? AND status = 'completed'
      `;

      const result = await this.executeQuery(query, [bookingId]);
      return result[0];
    } catch (error) {
      console.error('Error getting booking payment summary:', error);
      throw error;
    }
  }

  // Get payment statistics
  async getPaymentStats(startDate?: string, endDate?: string) {
    try {
      let query = `
        SELECT 
          COUNT(*) as total_payments,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_payments,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_payments,
          COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_payments,
          COUNT(CASE WHEN status = 'refunded' THEN 1 END) as refunded_payments,
          SUM(CASE WHEN status = 'completed' AND amount > 0 THEN amount ELSE 0 END) as total_revenue,
          SUM(CASE WHEN status = 'completed' AND amount < 0 THEN ABS(amount) ELSE 0 END) as total_refunds,
          AVG(CASE WHEN status = 'completed' AND amount > 0 THEN amount END) as average_payment,
          COUNT(DISTINCT booking_id) as unique_bookings
        FROM payment
      `;

      const params: any[] = [];

      if (startDate && endDate) {
        query += ' WHERE DATE(payment_timestamp) BETWEEN ? AND ?';
        params.push(startDate, endDate);
      } else if (startDate) {
        query += ' WHERE DATE(payment_timestamp) >= ?';
        params.push(startDate);
      } else if (endDate) {
        query += ' WHERE DATE(payment_timestamp) <= ?';
        params.push(endDate);
      }

      const result = await this.executeQuery(query, params);
      return result[0];
    } catch (error) {
      console.error('Error getting payment statistics:', error);
      throw error;
    }
  }

  // Get daily payment summary
  async getDailyPaymentSummary(days: number = 30) {
    try {
      const query = `
        SELECT 
          DATE(payment_timestamp) as payment_date,
          COUNT(*) as payment_count,
          SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as daily_revenue,
          SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) as daily_refunds,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
          COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_count
        FROM payment 
        WHERE payment_timestamp >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
        GROUP BY DATE(payment_timestamp)
        ORDER BY payment_date DESC
      `;

      return await this.executeQuery(query, [days]);
    } catch (error) {
      console.error('Error getting daily payment summary:', error);
      throw error;
    }
  }

  // Check if booking is fully paid
  async isBookingFullyPaid(bookingId: number): Promise<boolean> {
    try {
      // Get booking cost
      const bookingCostQuery = `
        SELECT SUM(s.price) as total_cost
        FROM passenger p
        LEFT JOIN seat s ON p.seat_id = s.seat_id
        WHERE p.booking_id = ?
      `;

      const costResult = await this.executeQuery<{ total_cost: number }>(bookingCostQuery, [bookingId]);
      const totalCost = costResult[0]?.total_cost || 0;

      // Get total payments
      const paymentsQuery = `
        SELECT SUM(amount) as total_paid
        FROM payment 
        WHERE booking_id = ? AND status = 'completed'
      `;

      const paymentResult = await this.executeQuery<{ total_paid: number }>(paymentsQuery, [bookingId]);
      const totalPaid = paymentResult[0]?.total_paid || 0;

      return totalPaid >= totalCost;
    } catch (error) {
      console.error('Error checking if booking is fully paid:', error);
      throw error;
    }
  }

  // Private method to simulate payment processing
  private async simulatePaymentProcessing(paymentData: PaymentRequest): Promise<boolean> {
    // In a real implementation, this would integrate with a payment gateway
    // For simulation, we'll randomly succeed/fail based on amount
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate 95% success rate
        const success = Math.random() > 0.05;
        resolve(success);
      }, 1000); // Simulate processing delay
    });
  }

  // Validate payment data
  validatePaymentData(paymentData: PaymentRequest): string[] {
    const errors: string[] = [];

    if (!paymentData.booking_id || paymentData.booking_id <= 0) {
      errors.push('Valid booking ID is required');
    }

    if (!paymentData.amount || paymentData.amount <= 0) {
      errors.push('Valid payment amount is required');
    }

    if (paymentData.amount && paymentData.amount > 1000000) {
      errors.push('Payment amount exceeds maximum limit');
    }

    if (!paymentData.currency || paymentData.currency.trim().length === 0) {
      errors.push('Currency is required');
    }

    const validCurrencies = ['USD', 'EUR', 'GBP', 'THB', 'JPY', 'SGD'];
    if (paymentData.currency && !validCurrencies.includes(paymentData.currency.toUpperCase())) {
      errors.push('Invalid currency code');
    }

    return errors;
  }
}