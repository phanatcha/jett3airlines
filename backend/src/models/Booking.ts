import { BaseModel } from './BaseModel';
import { Booking, CreateBooking, UpdateBooking, BookingRequest, BookingStatus } from '../types/database';

declare const Buffer: {
  from(str: string, encoding?: string): any;
};

export class BookingModel extends BaseModel {
  constructor() {
    super('booking');
  }

  async findBookingById(bookingId: number): Promise<Booking | null> {
    return await super.findById<Booking>(bookingId, 'booking_id');
  }

  async getBookingDetails(bookingId: number) {
    try {
      const query = `
        SELECT 
          b.*,
          c.firstname as client_firstname,
          c.lastname as client_lastname,
          c.email as client_email,
          c.phone_no as client_phone,
          f.flight_no,
          f.depart_when,
          f.arrive_when,
          f.status as flight_status,
          dep_airport.airport_name as departure_airport,
          dep_airport.city_name as departure_city,
          dep_airport.iata_code as departure_iata,
          arr_airport.airport_name as arrival_airport,
          arr_airport.city_name as arrival_city,
          arr_airport.iata_code as arrival_iata,
          a.type as airplane_type
        FROM booking b
        LEFT JOIN client c ON b.client_id = c.client_id
        LEFT JOIN flight f ON b.flight_id = f.flight_id
        LEFT JOIN airport dep_airport ON f.depart_airport_id = dep_airport.airport_id
        LEFT JOIN airport arr_airport ON f.arrive_airport_id = arr_airport.airport_id
        LEFT JOIN airplane a ON f.airplane_id = a.airplane_id
        WHERE b.booking_id = ?
      `;
      
      const results = await this.executeQuery(query, [bookingId]);
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error('Error getting booking details:', error);
      throw error;
    }
  }

  async getBookingsByClient(clientId: number, limit?: number, offset?: number) {
    try {
      let query = `
        SELECT 
          b.*,
          f.depart_when,
          f.arrive_when,
          f.status as flight_status,
          dep_airport.airport_name as departure_airport,
          dep_airport.city_name as departure_city,
          dep_airport.iata_code as departure_iata,
          arr_airport.airport_name as arrival_airport,
          arr_airport.city_name as arrival_city,
          arr_airport.iata_code as arrival_iata,
          COUNT(p.passenger_id) as passenger_count
        FROM booking b
        LEFT JOIN flight f ON b.flight_id = f.flight_id
        LEFT JOIN airport dep_airport ON f.depart_airport_id = dep_airport.airport_id
        LEFT JOIN airport arr_airport ON f.arrive_airport_id = arr_airport.airport_id
        LEFT JOIN passenger p ON b.booking_id = p.booking_id
        WHERE b.client_id = ?
        GROUP BY b.booking_id
        ORDER BY b.created_date DESC
      `;

      const params = [clientId];

      if (limit) {
        query += ` LIMIT ${parseInt(limit.toString())}`;
        
        if (offset) {
          query += ` OFFSET ${parseInt(offset.toString())}`;
        }
      }

      return await this.executeQuery(query, params);
    } catch (error) {
      console.error('Error getting bookings by client:', error);
      throw error;
    }
  }

  async getBookingPassengers(bookingId: number) {
    try {
      const query = `
        SELECT 
          p.*,
          s.seat_no,
          s.class as seat_class,
          s.price as seat_price
        FROM passenger p
        LEFT JOIN seat s ON p.seat_id = s.seat_id
        WHERE p.booking_id = ?
        ORDER BY p.passenger_id
      `;

      return await this.executeQuery(query, [bookingId]);
    } catch (error) {
      console.error('Error getting booking passengers:', error);
      throw error;
    }
  }

  async createBookingWithPassengers(bookingData: BookingRequest, clientId: number): Promise<number> {
    try {
      return await this.executeTransaction(async (connection) => {
        const bookingCreateData: CreateBooking = {
          support: bookingData.support || 'no',
          fasttrack: bookingData.fasttrack || 'no',
          status: BookingStatus.PENDING,
          client_id: clientId,
          flight_id: bookingData.flight_id
        };

        const bookingQuery = `
          INSERT INTO booking (support, fasttrack, status, created_date, client_id, flight_id)
          VALUES (?, ?, ?, NOW(), ?, ?)
        `;

        const bookingResult = await connection.execute(bookingQuery, [
          bookingCreateData.support,
          bookingCreateData.fasttrack,
          bookingCreateData.status,
          bookingCreateData.client_id,
          bookingCreateData.flight_id
        ]);

        const bookingId = (bookingResult as any)[0].insertId;

        for (const passengerData of bookingData.passengers) {
          const passengerQuery = `
            INSERT INTO passenger (firstname, lastname, passport_no, nationality, phone_no, gender, dob, weight_limit, seat_id, booking_id, flight_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;

          const passportValue = passengerData.passport_no || 'UNKNOWN';
          const encryptedPassport = Buffer.from(passportValue, 'utf8');

          const params = [
            passengerData.firstname || null,
            passengerData.lastname || null,
            encryptedPassport,
            passengerData.nationality || null,
            passengerData.phone_no || null,
            passengerData.gender || 'Other',
            passengerData.dob ? new Date(passengerData.dob) : null,
            passengerData.weight_limit || 20,
            passengerData.seat_id ?? null,
            bookingId,
            bookingData.flight_id
          ];

          await connection.execute(passengerQuery, params);
        }

        return bookingId;
      });
    } catch (error) {
      console.error('Error creating booking with passengers:', error);
      throw error;
    }
  }

  async updateBookingStatus(bookingId: number, status: BookingStatus): Promise<boolean> {
    try {
      return await this.update<Booking>(bookingId, { status }, 'booking_id');
    } catch (error) {
      console.error('Error updating booking status:', error);
      throw error;
    }
  }

  async cancelBooking(bookingId: number): Promise<boolean> {
    try {
      return await this.executeTransaction(async (connection) => {
        const updateBookingQuery = 'UPDATE booking SET status = ? WHERE booking_id = ?';
        await connection.execute(updateBookingQuery, [BookingStatus.CANCELLED, bookingId]);

        
        return true;
      });
    } catch (error) {
      console.error('Error cancelling booking:', error);
      throw error;
    }
  }

  async calculateBookingCost(bookingId: number): Promise<number> {
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
        return 0;
      }

      let totalCost = result[0]?.seat_cost || 0;
      
      if (result[0]?.support === 'yes' || result[0]?.support === 'Yes') {
        totalCost += 50;
      }
      
      if (result[0]?.fasttrack === 'yes' || result[0]?.fasttrack === 'Yes') {
        totalCost += 30;
      }

      return totalCost;
    } catch (error) {
      console.error('Error calculating booking cost:', error);
      throw error;
    }
  }

  async getBookingPaymentStatus(bookingId: number) {
    try {
      const query = `
        SELECT 
          p.payment_id,
          p.amount,
          p.currency,
          p.payment_timestamp,
          p.status as payment_status
        FROM payment p
        WHERE p.booking_id = ?
        ORDER BY p.payment_timestamp DESC
        LIMIT 1
      `;

      const result = await this.executeQuery(query, [bookingId]);
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error('Error getting booking payment status:', error);
      throw error;
    }
  }

  async getBookingsByFlight(flightId: number) {
    try {
      const query = `
        SELECT 
          b.*,
          c.firstname as client_firstname,
          c.lastname as client_lastname,
          c.email as client_email,
          COUNT(p.passenger_id) as passenger_count
        FROM booking b
        LEFT JOIN client c ON b.client_id = c.client_id
        LEFT JOIN passenger p ON b.booking_id = p.booking_id
        WHERE b.flight_id = ?
        GROUP BY b.booking_id
        ORDER BY b.created_date DESC
      `;

      return await this.executeQuery(query, [flightId]);
    } catch (error) {
      console.error('Error getting bookings by flight:', error);
      throw error;
    }
  }

  async getBookingStats() {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_bookings,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_bookings,
          COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_bookings,
          COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_bookings,
          COUNT(CASE WHEN DATE(created_date) = CURDATE() THEN 1 END) as today_bookings,
          AVG(
            (SELECT SUM(s.price) 
             FROM passenger p2 
             LEFT JOIN seat s ON p2.seat_id = s.seat_id 
             WHERE p2.booking_id = booking.booking_id)
          ) as average_booking_value
        FROM booking
      `;

      const result = await this.executeQuery(query);
      return result[0];
    } catch (error) {
      console.error('Error getting booking statistics:', error);
      throw error;
    }
  }

  async canModifyBooking(bookingId: number, clientId: number): Promise<boolean> {
    try {
      const booking = await this.findBookingById(bookingId);
      if (!booking) return false;

      if (booking.client_id !== clientId) return false;

      if (booking.status === BookingStatus.CANCELLED || booking.status === BookingStatus.COMPLETED) {
        return false;
      }

      const query = 'SELECT depart_when FROM flight WHERE flight_id = ?';
      const flightResult = await this.executeQuery<{ depart_when: Date }>(query, [booking.flight_id]);
      
      if (flightResult.length > 0) {
        const departureTime = new Date(flightResult[0].depart_when);
        const now = new Date();
        
        const hoursUntilDeparture = (departureTime.getTime() - now.getTime()) / (1000 * 60 * 60);
        return hoursUntilDeparture > 24;
      }

      return false;
    } catch (error) {
      console.error('Error checking if booking can be modified:', error);
      throw error;
    }
  }

  validateBookingData(bookingData: BookingRequest): string[] {
    const errors: string[] = [];

    if (!bookingData.flight_id || bookingData.flight_id <= 0) {
      errors.push('Valid flight ID is required');
    }

    if (!bookingData.passengers || bookingData.passengers.length === 0) {
      errors.push('At least one passenger is required');
    }

    if (bookingData.passengers) {
      bookingData.passengers.forEach((passenger, index) => {
        if (!passenger.firstname || passenger.firstname.trim().length === 0) {
          errors.push(`Passenger ${index + 1}: First name is required`);
        }

        if (!passenger.lastname || passenger.lastname.trim().length === 0) {
          errors.push(`Passenger ${index + 1}: Last name is required`);
        }

        if (!passenger.passport_no || passenger.passport_no.trim().length === 0) {
          errors.push(`Passenger ${index + 1}: Passport number is required`);
        }

        if (!passenger.nationality || passenger.nationality.trim().length === 0) {
          errors.push(`Passenger ${index + 1}: Nationality is required`);
        }

        if (!passenger.gender || !['Male', 'Female', 'Other'].includes(passenger.gender)) {
          errors.push(`Passenger ${index + 1}: Valid gender is required`);
        }

        if (!passenger.dob || !this.isValidDate(passenger.dob)) {
          errors.push(`Passenger ${index + 1}: Valid date of birth is required`);
        }

        if (!passenger.seat_id || passenger.seat_id <= 0) {
          errors.push(`Passenger ${index + 1}: Valid seat selection is required`);
        }
      });
    }

    return errors;
  }

  private isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  }
}