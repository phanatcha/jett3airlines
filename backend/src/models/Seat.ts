import { BaseModel } from './BaseModel';
import { Seat, SeatClass } from '../types/database';

export class SeatModel extends BaseModel {
  constructor() {
    super('seat');
  }

  // Find seat by ID
  async findSeatById(seatId: number): Promise<Seat | null> {
    return await super.findById<Seat>(seatId, 'seat_id');
  }

  // Get seats by airplane ID
  async getSeatsByAirplane(airplaneId: number) {
    try {
      const query = `
        SELECT * FROM seat 
        WHERE airplane_id = ?
        ORDER BY 
          CASE class
            WHEN 'FIRSTCLASS' THEN 1
            WHEN 'Business' THEN 2
            WHEN 'PREMIUM_ECONOMY' THEN 3
            WHEN 'Premium Economy' THEN 3
            WHEN 'ECONOMY' THEN 4
            WHEN 'Economy' THEN 4
            ELSE 5
          END,
          seat_no
      `;

      return await this.executeQuery(query, [airplaneId]);
    } catch (error) {
      console.error('Error getting seats by airplane:', error);
      throw error;
    }
  }

  // Get available seats for a flight
  async getAvailableSeatsForFlight(flightId: number, seatClass?: string) {
    try {
      let query = `
        SELECT 
          s.*,
          CASE WHEN p.seat_id IS NULL THEN 'available' ELSE 'booked' END as availability
        FROM seat s
        LEFT JOIN passenger p ON s.seat_id = p.seat_id AND p.flight_id = ?
        WHERE s.airplane_id = (SELECT airplane_id FROM flight WHERE flight_id = ?)
      `;

      const params: any[] = [flightId, flightId];

      if (seatClass) {
        query += ' AND s.class = ?';
        params.push(seatClass);
      }

      query += `
        ORDER BY 
          CASE s.class
            WHEN 'FIRSTCLASS' THEN 1
            WHEN 'Business' THEN 2
            WHEN 'PREMIUM_ECONOMY' THEN 3
            WHEN 'Premium Economy' THEN 3
            WHEN 'ECONOMY' THEN 4
            WHEN 'Economy' THEN 4
            ELSE 5
          END,
          s.seat_no
      `;

      return await this.executeQuery(query, params);
    } catch (error) {
      console.error('Error getting available seats for flight:', error);
      throw error;
    }
  }

  // Get seat availability summary for a flight
  async getSeatAvailabilitySummary(flightId: number) {
    try {
      const query = `
        SELECT 
          s.class,
          COUNT(s.seat_id) as total_seats,
          COUNT(p.seat_id) as booked_seats,
          COUNT(s.seat_id) - COUNT(p.seat_id) as available_seats,
          MIN(s.price) as min_price,
          MAX(s.price) as max_price,
          AVG(s.price) as avg_price
        FROM seat s
        LEFT JOIN passenger p ON s.seat_id = p.seat_id AND p.flight_id = ?
        WHERE s.airplane_id = (SELECT airplane_id FROM flight WHERE flight_id = ?)
        GROUP BY s.class
        ORDER BY 
          CASE s.class
            WHEN 'FIRSTCLASS' THEN 1
            WHEN 'Business' THEN 2
            WHEN 'PREMIUM_ECONOMY' THEN 3
            WHEN 'Premium Economy' THEN 3
            WHEN 'ECONOMY' THEN 4
            WHEN 'Economy' THEN 4
            ELSE 5
          END
      `;

      return await this.executeQuery(query, [flightId, flightId]);
    } catch (error) {
      console.error('Error getting seat availability summary:', error);
      throw error;
    }
  }

  // Check if specific seats are available for a flight
  async checkSeatsAvailability(flightId: number, seatIds: number[]): Promise<{ seatId: number; available: boolean }[]> {
    try {
      if (seatIds.length === 0) return [];

      const placeholders = seatIds.map(() => '?').join(',');
      const query = `
        SELECT 
          s.seat_id,
          CASE 
            WHEN p.seat_id IS NULL THEN 1
            WHEN b.status = 'cancelled' THEN 1
            ELSE 0 
          END as available
        FROM seat s
        LEFT JOIN passenger p ON s.seat_id = p.seat_id AND p.flight_id = ?
        LEFT JOIN booking b ON p.booking_id = b.booking_id
        WHERE s.seat_id IN (${placeholders})
      `;

      const params = [flightId, ...seatIds];
      const results = await this.executeQuery<{ seat_id: number; available: number }>(query, params);
      
      return results.map(result => ({
        seatId: result.seat_id,
        available: result.available === 1
      }));
    } catch (error) {
      console.error('Error checking seats availability:', error);
      throw error;
    }
  }

  // Get seat details with passenger information
  async getSeatWithPassenger(seatId: number, flightId: number) {
    try {
      const query = `
        SELECT 
          s.*,
          p.passenger_id,
          p.firstname as passenger_firstname,
          p.lastname as passenger_lastname,
          p.nationality,
          b.booking_id,
          c.firstname as client_firstname,
          c.lastname as client_lastname
        FROM seat s
        LEFT JOIN passenger p ON s.seat_id = p.seat_id AND p.flight_id = ?
        LEFT JOIN booking b ON p.booking_id = b.booking_id
        LEFT JOIN client c ON b.client_id = c.client_id
        WHERE s.seat_id = ?
      `;

      const results = await this.executeQuery(query, [flightId, seatId]);
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error('Error getting seat with passenger:', error);
      throw error;
    }
  }

  // Get seats by class
  async getSeatsByClass(airplaneId: number, seatClass: string) {
    try {
      const query = `
        SELECT * FROM seat 
        WHERE airplane_id = ? AND class = ?
        ORDER BY seat_no
      `;

      return await this.executeQuery(query, [airplaneId, seatClass]);
    } catch (error) {
      console.error('Error getting seats by class:', error);
      throw error;
    }
  }

  // Get seat pricing for an airplane
  async getSeatPricing(airplaneId: number) {
    try {
      const query = `
        SELECT 
          class,
          MIN(price) as min_price,
          MAX(price) as max_price,
          AVG(price) as avg_price,
          COUNT(*) as seat_count
        FROM seat 
        WHERE airplane_id = ?
        GROUP BY class
        ORDER BY 
          CASE class
            WHEN 'FIRSTCLASS' THEN 1
            WHEN 'Business' THEN 2
            WHEN 'PREMIUM_ECONOMY' THEN 3
            WHEN 'Premium Economy' THEN 3
            WHEN 'ECONOMY' THEN 4
            WHEN 'Economy' THEN 4
            ELSE 5
          END
      `;

      return await this.executeQuery(query, [airplaneId]);
    } catch (error) {
      console.error('Error getting seat pricing:', error);
      throw error;
    }
  }

  // Create new seat (admin function)
  async createSeat(seatData: Omit<Seat, 'seat_id'>): Promise<number> {
    try {
      return await this.create(seatData as any);
    } catch (error) {
      console.error('Error creating seat:', error);
      throw error;
    }
  }

  // Update seat information (admin function)
  async updateSeat(seatId: number, updateData: Partial<Seat>): Promise<boolean> {
    try {
      return await this.update<Seat>(seatId, updateData, 'seat_id');
    } catch (error) {
      console.error('Error updating seat:', error);
      throw error;
    }
  }

  // Delete seat (admin function)
  async deleteSeat(seatId: number): Promise<boolean> {
    try {
      // Check if seat has any bookings
      const bookingCount = await this.executeQuery(
        'SELECT COUNT(*) as count FROM passenger WHERE seat_id = ?',
        [seatId]
      );

      if ((bookingCount[0] as any).count > 0) {
        throw new Error('Cannot delete seat with existing bookings');
      }

      return await this.delete(seatId, 'seat_id');
    } catch (error) {
      console.error('Error deleting seat:', error);
      throw error;
    }
  }

  // Get seat map for an airplane
  async getSeatMap(airplaneId: number, flightId?: number) {
    try {
      let query = `
        SELECT 
          s.*,
          CASE WHEN p.seat_id IS NULL THEN 'available' ELSE 'booked' END as status
        FROM seat s
        LEFT JOIN passenger p ON s.seat_id = p.seat_id
      `;

      const params = [airplaneId];

      if (flightId) {
        query += ' AND p.flight_id = ?';
        params.push(flightId);
      }

      query += `
        WHERE s.airplane_id = ?
        ORDER BY 
          CASE s.class
            WHEN 'FIRSTCLASS' THEN 1
            WHEN 'Business' THEN 2
            WHEN 'PREMIUM_ECONOMY' THEN 3
            WHEN 'Premium Economy' THEN 3
            WHEN 'ECONOMY' THEN 4
            WHEN 'Economy' THEN 4
            ELSE 5
          END,
          s.seat_no
      `;

      // Rearrange params for the final query
      const finalParams = flightId ? [flightId, airplaneId] : [airplaneId];
      
      return await this.executeQuery(query, finalParams);
    } catch (error) {
      console.error('Error getting seat map:', error);
      throw error;
    }
  }

  // Get seat statistics
  async getSeatStats() {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_seats,
          COUNT(CASE WHEN class = 'FIRSTCLASS' THEN 1 END) as first_class_seats,
          COUNT(CASE WHEN class = 'Business' THEN 1 END) as business_seats,
          COUNT(CASE WHEN class IN ('PREMIUM_ECONOMY', 'Premium Economy') THEN 1 END) as premium_economy_seats,
          COUNT(CASE WHEN class IN ('ECONOMY', 'Economy') THEN 1 END) as economy_seats,
          AVG(price) as average_price,
          MIN(price) as min_price,
          MAX(price) as max_price
        FROM seat
      `;

      const result = await this.executeQuery(query);
      return result[0];
    } catch (error) {
      console.error('Error getting seat statistics:', error);
      throw error;
    }
  }

  // Validate seat data
  validateSeatData(seatData: any): string[] {
    const errors: string[] = [];

    if (!seatData.seat_no || seatData.seat_no.trim().length === 0) {
      errors.push('Seat number is required');
    }

    if (!seatData.class || seatData.class.trim().length === 0) {
      errors.push('Seat class is required');
    }

    const validClasses = ['FIRSTCLASS', 'Business', 'PREMIUM_ECONOMY', 'Premium Economy', 'ECONOMY', 'Economy'];
    if (seatData.class && !validClasses.includes(seatData.class)) {
      errors.push('Invalid seat class');
    }

    if (!seatData.price || seatData.price <= 0) {
      errors.push('Valid seat price is required');
    }

    if (!seatData.airplane_id || seatData.airplane_id <= 0) {
      errors.push('Valid airplane ID is required');
    }

    // Validate seat number format (e.g., 1A, 12F, etc.)
    if (seatData.seat_no && !/^\d+[A-J]$/.test(seatData.seat_no)) {
      errors.push('Seat number must be in format like 1A, 12F, etc.');
    }

    return errors;
  }
}