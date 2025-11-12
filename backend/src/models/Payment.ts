import { BaseModel } from './BaseModel';
import { Payment, CreatePayment, PaymentStatus, BookingStatus } from '../types/database';

export class PaymentModel extends BaseModel {
  constructor() {
    super('payment');
  }

  async findPaymentById(paymentId: number): Promise<Payment | null> {
    return await super.findById<Payment>(paymentId, 'payment_id');
  }

  async findPaymentByBookingId(bookingId: number): Promise<Payment | null> {
    try {
      const query = `
        SELECT * FROM payment 
        WHERE booking_id = ? 
        ORDER BY payment_timestamp DESC 
        LIMIT 1
      `;
      const results = await this.executeQuery<Payment>(query, [bookingId]);
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error('Error finding payment by booking ID:', error);
      throw error;
    }
  }

  async getPaymentsByBookingId(bookingId: number): Promise<Payment[]> {
    try {
      const query = `
        SELECT * FROM payment 
        WHERE booking_id = ? 
        ORDER BY payment_timestamp DESC
      `;
      return await this.executeQuery<Payment>(query, [bookingId]);
    } catch (error) {
      console.error('Error getting payments by booking ID:', error);
      throw error;
    }
  }

  async createPayment(paymentData: CreatePayment): Promise<number> {
    try {
      const query = `
        INSERT INTO payment (amount, currency, status, booking_id, payment_timestamp)
        VALUES (?, ?, ?, ?, NOW())
      `;
      
      const result = await this.executeQuery(query, [
        paymentData.amount,
        paymentData.currency,
        paymentData.status,
        paymentData.booking_id
      ]);

      return (result as any).insertId;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  }

  async processPayment(bookingId: number, amount: number, currency: string = 'USD'): Promise<number> {
    try {
      return await this.executeTransaction(async (connection) => {
        const paymentQuery = `
          INSERT INTO payment (amount, currency, status, booking_id, payment_timestamp)
          VALUES (?, ?, ?, ?, NOW())
        `;
        
        const paymentResult = await connection.execute(paymentQuery, [
          amount,
          currency,
          PaymentStatus.COMPLETED,
          bookingId
        ]);

        const paymentId = paymentResult[0].insertId;

        const bookingQuery = `
          UPDATE booking 
          SET status = ?, updated_date = NOW() 
          WHERE booking_id = ?
        `;
        
        await connection.execute(bookingQuery, [
          BookingStatus.CONFIRMED,
          bookingId
        ]);

        return paymentId;
      });
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  }

  async updatePaymentStatus(paymentId: number, status: PaymentStatus): Promise<boolean> {
    try {
      return await this.update<Payment>(paymentId, { status }, 'payment_id');
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  }

  async processRefund(bookingId: number): Promise<number> {
    try {
      return await this.executeTransaction(async (connection) => {
        const originalPaymentQuery = `
          SELECT * FROM payment 
          WHERE booking_id = ? AND status = ? 
          ORDER BY payment_timestamp DESC 
          LIMIT 1
        `;
        
        const originalPayments = await connection.execute(originalPaymentQuery, [
          bookingId,
          PaymentStatus.COMPLETED
        ]);

        if (originalPayments[0].length === 0) {
          throw new Error('No completed payment found for this booking');
        }

        const originalPayment = originalPayments[0][0];

        const refundQuery = `
          INSERT INTO payment (amount, currency, status, booking_id, payment_timestamp)
          VALUES (?, ?, ?, ?, NOW())
        `;
        
        const refundResult = await connection.execute(refundQuery, [
          -originalPayment.amount,
          originalPayment.currency,
          PaymentStatus.REFUNDED,
          bookingId
        ]);

        const refundId = refundResult[0].insertId;

        const bookingQuery = `
          UPDATE booking 
          SET status = ?, updated_date = NOW() 
          WHERE booking_id = ?
        `;
        
        await connection.execute(bookingQuery, [
          BookingStatus.CANCELLED,
          bookingId
        ]);

        return refundId;
      });
    } catch (error) {
      console.error('Error processing refund:', error);
      throw error;
    }
  }

  async getPaymentReceipt(paymentId: number) {
    try {
      const query = `
        SELECT 
          p.*,
          b.booking_id,
          b.booking_no,
          b.created_date as booking_date,
          b.support,
          b.fasttrack,
          c.firstname as client_firstname,
          c.lastname as client_lastname,
          c.email as client_email,
          f.flight_no,
          f.depart_when,
          f.arrive_when,
          dep_airport.airport_name as departure_airport,
          dep_airport.city_name as departure_city,
          dep_airport.iata_code as departure_iata,
          arr_airport.airport_name as arrival_airport,
          arr_airport.city_name as arrival_city,
          arr_airport.iata_code as arrival_iata,
          COUNT(pass.passenger_id) as passenger_count
        FROM payment p
        LEFT JOIN booking b ON p.booking_id = b.booking_id
        LEFT JOIN client c ON b.client_id = c.client_id
        LEFT JOIN flight f ON b.flight_id = f.flight_id
        LEFT JOIN airport dep_airport ON f.depart_airport_id = dep_airport.airport_id
        LEFT JOIN airport arr_airport ON f.arrive_airport_id = arr_airport.airport_id
        LEFT JOIN passenger pass ON b.booking_id = pass.booking_id
        WHERE p.payment_id = ?
        GROUP BY p.payment_id
      `;
      
      const results = await this.executeQuery(query, [paymentId]);
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error('Error getting payment receipt:', error);
      throw error;
    }
  }

  async validatePaymentAmount(bookingId: number, paymentAmount: number): Promise<boolean> {
    try {
      const query = `
        SELECT 
          SUM(s.price) as seat_cost,
          b.support,
          b.fasttrack
        FROM passenger p
        LEFT JOIN seat s ON p.seat_id = s.seat_id
        JOIN booking b ON p.booking_id = b.booking_id
        WHERE p.booking_id = ?
        GROUP BY b.booking_id, b.support, b.fasttrack
      `;
      
      const result = await this.executeQuery<{ seat_cost: number; support: string; fasttrack: string }>(query, [bookingId]);
      
      if (result.length === 0) {
        return false;
      }

      let expectedAmount = result[0]?.seat_cost || 0;
      
      if (result[0]?.support === 'yes' || result[0]?.support === 'Yes') {
        expectedAmount += 50;
      }
      
      if (result[0]?.fasttrack === 'yes' || result[0]?.fasttrack === 'Yes') {
        expectedAmount += 30;
      }
      
      return Math.abs(expectedAmount - paymentAmount) < 0.01;
    } catch (error) {
      console.error('Error validating payment amount:', error);
      throw error;
    }
  }

  async getPaymentStats() {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_payments,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_payments,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_payments,
          COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_payments,
          COUNT(CASE WHEN status = 'refunded' THEN 1 END) as refunded_payments,
          SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as total_revenue,
          SUM(CASE WHEN status = 'refunded' THEN ABS(amount) ELSE 0 END) as total_refunds,
          AVG(CASE WHEN status = 'completed' THEN amount ELSE NULL END) as average_payment
        FROM payment
      `;
      
      const result = await this.executeQuery(query);
      return result[0];
    } catch (error) {
      console.error('Error getting payment statistics:', error);
      throw error;
    }
  }

  validatePaymentData(amount: number, currency: string, bookingId: number): string[] {
    const errors: string[] = [];

    if (!amount || amount <= 0) {
      errors.push('Payment amount must be greater than zero');
    }

    if (!currency || currency.trim().length === 0) {
      errors.push('Currency is required');
    }

    if (currency && currency.length !== 3) {
      errors.push('Currency must be a 3-letter ISO code (e.g., USD, EUR)');
    }

    if (!bookingId || bookingId <= 0) {
      errors.push('Valid booking ID is required');
    }

    return errors;
  }
}
