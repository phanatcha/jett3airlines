import { BaseModel } from './BaseModel';
import { Flight, FlightSearchRequest, FlightStatus } from '../types/database';
import database from '../db';

export class FlightModel extends BaseModel {
  constructor() {
    super('flight');
  }

  async findFlightById(flightId: number): Promise<Flight | null> {
    return await super.findById<Flight>(flightId, 'flight_id');
  }

  async getFlightDetails(flightId: number) {
    try {
      const query = `
        SELECT 
          f.*,
          dep_airport.airport_name as departure_airport,
          dep_airport.city_name as departure_city,
          dep_airport.iata_code as departure_iata,
          arr_airport.airport_name as arrival_airport,
          arr_airport.city_name as arrival_city,
          arr_airport.iata_code as arrival_iata,
          a.type as airplane_type,
          a.capacity as airplane_capacity,
          a.min_price as base_price
        FROM flight f
        LEFT JOIN airport dep_airport ON f.depart_airport_id = dep_airport.airport_id
        LEFT JOIN airport arr_airport ON f.arrive_airport_id = arr_airport.airport_id
        LEFT JOIN airplane a ON f.airplane_id = a.airplane_id
        WHERE f.flight_id = ?
      `;
      
      const results = await this.executeQuery(query, [flightId]);
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error('Error getting flight details:', error);
      throw error;
    }
  }

  async searchFlights(searchParams: FlightSearchRequest) {
    try {
      const cabinClass = searchParams.cabin_class || 'Economy';
      
      let query = `
        SELECT 
          f.*,
          dep_airport.airport_name as departure_airport,
          dep_airport.city_name as departure_city,
          dep_airport.iata_code as departure_iata,
          arr_airport.airport_name as arrival_airport,
          arr_airport.city_name as arrival_city,
          arr_airport.iata_code as arrival_iata,
          a.type as airplane_type,
          a.capacity as airplane_capacity,
          COALESCE(f.base_price, a.min_price, 100.00) as base_price,
          COALESCE(f.premium_economy_multiplier, 1.50) as premium_economy_multiplier,
          COALESCE(f.business_multiplier, 2.50) as business_multiplier,
          CASE 
            WHEN ? = 'Business' THEN COALESCE(f.base_price, a.min_price, 100.00) * COALESCE(f.business_multiplier, 2.50)
            WHEN ? = 'Premium Economy' THEN COALESCE(f.base_price, a.min_price, 100.00) * COALESCE(f.premium_economy_multiplier, 1.50)
            ELSE COALESCE(f.base_price, a.min_price, 100.00)
          END as price,
          COUNT(DISTINCT CASE WHEN s.class = ? THEN p.passenger_id END) as booked_seats_in_class,
          COUNT(DISTINCT CASE WHEN s.class = ? THEN s.seat_id END) as total_seats_in_class
        FROM flight f
        LEFT JOIN airport dep_airport ON f.depart_airport_id = dep_airport.airport_id
        LEFT JOIN airport arr_airport ON f.arrive_airport_id = arr_airport.airport_id
        LEFT JOIN airplane a ON f.airplane_id = a.airplane_id
        LEFT JOIN seat s ON a.airplane_id = s.airplane_id
        LEFT JOIN passenger p ON f.flight_id = p.flight_id AND s.seat_id = p.seat_id
        WHERE f.status = 'Scheduled'
      `;

      const params: any[] = [cabinClass, cabinClass, cabinClass, cabinClass];

      if (searchParams.depart_airport_id) {
        query += ' AND f.depart_airport_id = ?';
        params.push(searchParams.depart_airport_id);
      }

      if (searchParams.arrive_airport_id) {
        query += ' AND f.arrive_airport_id = ?';
        params.push(searchParams.arrive_airport_id);
      }

      if (searchParams.depart_date) {
        query += ' AND DATE(f.depart_when) = ?';
        params.push(searchParams.depart_date);
      }

      query += ' GROUP BY f.flight_id HAVING total_seats_in_class > 0 ORDER BY f.depart_when ASC';

      const results = await this.executeQuery(query, params);
      
      return results.map((flight: any) => ({
        ...flight,
        cabin_class: cabinClass,
        available_seats: flight.total_seats_in_class - flight.booked_seats_in_class,
        duration: this.calculateFlightDuration(flight.depart_when, flight.arrive_when)
      }));
    } catch (error) {
      console.error('Error searching flights:', error);
      throw error;
    }
  }

  async getAvailableSeats(flightId: number, seatClass?: string) {
    try {
      let query = `
        SELECT 
          s.*,
          CASE 
            WHEN p.seat_id IS NULL THEN 'available'
            WHEN b.status = 'cancelled' THEN 'available'
            ELSE 'booked' 
          END as availability
        FROM seat s
        LEFT JOIN passenger p ON s.seat_id = p.seat_id AND p.flight_id = ?
        LEFT JOIN booking b ON p.booking_id = b.booking_id
        WHERE s.airplane_id = (SELECT airplane_id FROM flight WHERE flight_id = ?)
      `;

      const params: any[] = [flightId, flightId];

      if (seatClass) {
        query += ' AND s.class = ?';
        params.push(seatClass);
      }

      query += ' ORDER BY s.seat_no';

      return await this.executeQuery(query, params);
    } catch (error) {
      console.error('Error getting available seats:', error);
      throw error;
    }
  }

  async checkSeatAvailability(flightId: number, seatIds: number[]): Promise<boolean> {
    try {
      if (seatIds.length === 0) return true;

      const placeholders = seatIds.map(() => '?').join(',');
      const query = `
        SELECT COUNT(*) as booked_count
        FROM passenger p
        INNER JOIN booking b ON p.booking_id = b.booking_id
        WHERE p.flight_id = ? 
          AND p.seat_id IN (${placeholders})
          AND b.status != 'cancelled'
      `;

      const params = [flightId, ...seatIds];
      const result = await this.executeQuery<{ booked_count: number }>(query, params);
      
      return result[0].booked_count === 0;
    } catch (error) {
      console.error('Error checking seat availability:', error);
      throw error;
    }
  }

  async getFlightsByAirport(airportId: number, isDeparture: boolean = true) {
    try {
      const airportColumn = isDeparture ? 'depart_airport_id' : 'arrive_airport_id';
      const query = `
        SELECT 
          f.*,
          dep_airport.airport_name as departure_airport,
          dep_airport.iata_code as departure_iata,
          arr_airport.airport_name as arrival_airport,
          arr_airport.iata_code as arrival_iata,
          a.type as airplane_type
        FROM flight f
        LEFT JOIN airport dep_airport ON f.depart_airport_id = dep_airport.airport_id
        LEFT JOIN airport arr_airport ON f.arrive_airport_id = arr_airport.airport_id
        LEFT JOIN airplane a ON f.airplane_id = a.airplane_id
        WHERE f.${airportColumn} = ?
        ORDER BY f.depart_when ASC
      `;

      return await this.executeQuery(query, [airportId]);
    } catch (error) {
      console.error('Error getting flights by airport:', error);
      throw error;
    }
  }

  async getFlightsByDateRange(startDate: string, endDate: string) {
    try {
      const query = `
        SELECT 
          f.*,
          dep_airport.airport_name as departure_airport,
          dep_airport.iata_code as departure_iata,
          arr_airport.airport_name as arrival_airport,
          arr_airport.iata_code as arrival_iata
        FROM flight f
        LEFT JOIN airport dep_airport ON f.depart_airport_id = dep_airport.airport_id
        LEFT JOIN airport arr_airport ON f.arrive_airport_id = arr_airport.airport_id
        WHERE DATE(f.depart_when) BETWEEN ? AND ?
        ORDER BY f.depart_when ASC
      `;

      return await this.executeQuery(query, [startDate, endDate]);
    } catch (error) {
      console.error('Error getting flights by date range:', error);
      throw error;
    }
  }

  async updateFlightStatus(flightId: number, status: FlightStatus): Promise<boolean> {
    try {
      return await this.update<Flight>(flightId, { status }, 'flight_id');
    } catch (error) {
      console.error('Error updating flight status:', error);
      throw error;
    }
  }

  async createFlight(flightData: Omit<Flight, 'flight_id'>): Promise<number> {
    try {
      return await this.create(flightData as any);
    } catch (error) {
      console.error('Error creating flight:', error);
      throw error;
    }
  }

  async updateFlight(flightId: number, updateData: Partial<Flight>): Promise<boolean> {
    try {
      return await this.update<Flight>(flightId, updateData, 'flight_id');
    } catch (error) {
      console.error('Error updating flight:', error);
      throw error;
    }
  }

  async deleteFlight(flightId: number): Promise<boolean> {
    try {
      // Check for active bookings (not cancelled)
      const rows = await database.query(
        `SELECT COUNT(*) as count FROM booking 
         WHERE flight_id = ? AND status != 'Cancelled'`,
        [flightId]
      );
      
      const bookingCount = (rows as any)[0].count;
      if (bookingCount > 0) {
        throw new Error('Cannot delete flight with existing active bookings');
      }

      return await this.delete(flightId, 'flight_id');
    } catch (error) {
      console.error('Error deleting flight:', error);
      throw error;
    }
  }

  async getFlightStats() {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_flights,
          COUNT(CASE WHEN status = 'Scheduled' THEN 1 END) as scheduled_flights,
          COUNT(CASE WHEN status = 'Delayed' THEN 1 END) as delayed_flights,
          COUNT(CASE WHEN status = 'Cancelled' THEN 1 END) as cancelled_flights,
          COUNT(CASE WHEN DATE(depart_when) = CURDATE() THEN 1 END) as today_flights
        FROM flight
      `;

      const result = await this.executeQuery(query);
      return result[0];
    } catch (error) {
      console.error('Error getting flight statistics:', error);
      throw error;
    }
  }

  private calculateFlightDuration(departTime: Date, arriveTime: Date): string {
    const depart = new Date(departTime);
    const arrive = new Date(arriveTime);
    const durationMs = arrive.getTime() - depart.getTime();
    
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  }

  validateFlightData(flightData: any): string[] {
    const errors: string[] = [];

    if (!flightData.depart_when || !this.isValidDate(flightData.depart_when)) {
      errors.push('Valid departure time is required');
    }

    if (!flightData.arrive_when || !this.isValidDate(flightData.arrive_when)) {
      errors.push('Valid arrival time is required');
    }

    if (flightData.depart_when && flightData.arrive_when) {
      const depart = new Date(flightData.depart_when);
      const arrive = new Date(flightData.arrive_when);
      
      if (arrive <= depart) {
        errors.push('Arrival time must be after departure time');
      }
    }

    if (!flightData.airplane_id || flightData.airplane_id <= 0) {
      errors.push('Valid airplane ID is required');
    }

    if (!flightData.depart_airport_id || flightData.depart_airport_id <= 0) {
      errors.push('Valid departure airport ID is required');
    }

    if (!flightData.arrive_airport_id || flightData.arrive_airport_id <= 0) {
      errors.push('Valid arrival airport ID is required');
    }

    if (flightData.depart_airport_id === flightData.arrive_airport_id) {
      errors.push('Departure and arrival airports must be different');
    }

    return errors;
  }

  private isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  }
}