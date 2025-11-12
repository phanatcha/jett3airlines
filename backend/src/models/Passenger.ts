import { BaseModel } from './BaseModel';
import { Passenger, CreatePassenger, UpdatePassenger } from '../types/database';

declare const Buffer: {
  from(str: string, encoding?: string): any;
};

export class PassengerModel extends BaseModel {
  constructor() {
    super('passenger');
  }

  async findPassengerById(passengerId: number): Promise<Passenger | null> {
    return await super.findById<Passenger>(passengerId, 'passenger_id');
  }

  async getPassengerDetails(passengerId: number) {
    try {
      const query = `
        SELECT 
          p.*,
          s.seat_no,
          s.class as seat_class,
          s.price as seat_price,
          f.depart_when,
          f.arrive_when,
          dep_airport.airport_name as departure_airport,
          dep_airport.iata_code as departure_iata,
          arr_airport.airport_name as arrival_airport,
          arr_airport.iata_code as arrival_iata
        FROM passenger p
        LEFT JOIN seat s ON p.seat_id = s.seat_id
        LEFT JOIN flight f ON p.flight_id = f.flight_id
        LEFT JOIN airport dep_airport ON f.depart_airport_id = dep_airport.airport_id
        LEFT JOIN airport arr_airport ON f.arrive_airport_id = arr_airport.airport_id
        WHERE p.passenger_id = ?
      `;
      
      const results = await this.executeQuery(query, [passengerId]);
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error('Error getting passenger details:', error);
      throw error;
    }
  }

  async getPassengersByBooking(bookingId: number) {
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
      console.error('Error getting passengers by booking:', error);
      throw error;
    }
  }

  async getPassengersByFlight(flightId: number) {
    try {
      const query = `
        SELECT 
          p.*,
          s.seat_no,
          s.class as seat_class,
          b.booking_id,
          c.firstname as client_firstname,
          c.lastname as client_lastname
        FROM passenger p
        LEFT JOIN seat s ON p.seat_id = s.seat_id
        LEFT JOIN booking b ON p.booking_id = b.booking_id
        LEFT JOIN client c ON b.client_id = c.client_id
        WHERE p.flight_id = ?
        ORDER BY s.seat_no
      `;

      return await this.executeQuery(query, [flightId]);
    } catch (error) {
      console.error('Error getting passengers by flight:', error);
      throw error;
    }
  }

  async createPassenger(passengerData: CreatePassenger): Promise<number> {
    try {
      const encryptedPassport = Buffer.from(passengerData.passport_no.toString(), 'utf8');
      
      const createData = {
        ...passengerData,
        passport_no: encryptedPassport
      };

      return await this.create(createData as any);
    } catch (error) {
      console.error('Error creating passenger:', error);
      throw error;
    }
  }

  async updatePassenger(passengerId: number, updateData: UpdatePassenger): Promise<boolean> {
    try {
      if (updateData.passport_no) {
        updateData.passport_no = Buffer.from(updateData.passport_no.toString(), 'utf8');
      }

      return await this.update<Passenger>(passengerId, updateData, 'passenger_id');
    } catch (error) {
      console.error('Error updating passenger:', error);
      throw error;
    }
  }

  async deletePassenger(passengerId: number): Promise<boolean> {
    return await this.delete(passengerId, 'passenger_id');
  }

  async changeSeat(passengerId: number, newSeatId: number): Promise<boolean> {
    try {
      return await this.executeTransaction(async (connection) => {
        const passengerQuery = 'SELECT flight_id FROM passenger WHERE passenger_id = ?';
        const passengerResult = await connection.execute(passengerQuery, [passengerId]);
        
        if ((passengerResult as any)[0].length === 0) {
          throw new Error('Passenger not found');
        }

        const flightId = (passengerResult as any)[0][0].flight_id;

        const seatCheckQuery = `
          SELECT COUNT(*) as count 
          FROM passenger 
          WHERE flight_id = ? AND seat_id = ?
        `;
        const seatCheckResult = await connection.execute(seatCheckQuery, [flightId, newSeatId]);
        
        if ((seatCheckResult as any)[0][0].count > 0) {
          throw new Error('Seat is already occupied');
        }

        const updateQuery = 'UPDATE passenger SET seat_id = ? WHERE passenger_id = ?';
        await connection.execute(updateQuery, [newSeatId, passengerId]);

        return true;
      });
    } catch (error) {
      console.error('Error changing passenger seat:', error);
      throw error;
    }
  }

  async getPassengerBaggage(passengerId: number) {
    try {
      const query = `
        SELECT * FROM baggage 
        WHERE passenger_id = ?
        ORDER BY baggage_id
      `;

      return await this.executeQuery(query, [passengerId]);
    } catch (error) {
      console.error('Error getting passenger baggage:', error);
      throw error;
    }
  }

  async canModifyPassenger(passengerId: number): Promise<boolean> {
    try {
      const query = `
        SELECT f.depart_when, b.status as booking_status
        FROM passenger p
        LEFT JOIN flight f ON p.flight_id = f.flight_id
        LEFT JOIN booking b ON p.booking_id = b.booking_id
        WHERE p.passenger_id = ?
      `;

      const result = await this.executeQuery<{ depart_when: Date; booking_status: string }>(query, [passengerId]);
      
      if (result.length === 0) return false;

      const { depart_when, booking_status } = result[0];

      if (booking_status === 'cancelled' || booking_status === 'completed') {
        return false;
      }

      const departureTime = new Date(depart_when);
      const now = new Date();
      
      const hoursUntilDeparture = (departureTime.getTime() - now.getTime()) / (1000 * 60 * 60);
      return hoursUntilDeparture > 24;
    } catch (error) {
      console.error('Error checking if passenger can be modified:', error);
      throw error;
    }
  }

  async getPassengerStats() {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_passengers,
          COUNT(DISTINCT nationality) as unique_nationalities,
          COUNT(CASE WHEN gender = 'Male' THEN 1 END) as male_passengers,
          COUNT(CASE WHEN gender = 'Female' THEN 1 END) as female_passengers,
          AVG(weight_limit) as average_weight_limit
        FROM passenger
      `;

      const result = await this.executeQuery(query);
      return result[0];
    } catch (error) {
      console.error('Error getting passenger statistics:', error);
      throw error;
    }
  }

  async searchPassengersByName(searchTerm: string, limit: number = 50) {
    try {
      const query = `
        SELECT 
          p.*,
          s.seat_no,
          s.class as seat_class,
          f.depart_when,
          f.arrive_when,
          dep_airport.iata_code as departure_iata,
          arr_airport.iata_code as arrival_iata
        FROM passenger p
        LEFT JOIN seat s ON p.seat_id = s.seat_id
        LEFT JOIN flight f ON p.flight_id = f.flight_id
        LEFT JOIN airport dep_airport ON f.depart_airport_id = dep_airport.airport_id
        LEFT JOIN airport arr_airport ON f.arrive_airport_id = arr_airport.airport_id
        WHERE CONCAT(p.firstname, ' ', p.lastname) LIKE ?
        ORDER BY p.firstname, p.lastname
        LIMIT ?
      `;

      return await this.executeQuery(query, [`%${searchTerm}%`, limit]);
    } catch (error) {
      console.error('Error searching passengers by name:', error);
      throw error;
    }
  }

  validatePassengerData(passengerData: any): string[] {
    const errors: string[] = [];

    if (!passengerData.firstname || passengerData.firstname.trim().length === 0) {
      errors.push('First name is required');
    }

    if (!passengerData.lastname || passengerData.lastname.trim().length === 0) {
      errors.push('Last name is required');
    }

    if (!passengerData.passport_no || passengerData.passport_no.trim().length === 0) {
      errors.push('Passport number is required');
    }

    if (!passengerData.nationality || passengerData.nationality.trim().length === 0) {
      errors.push('Nationality is required');
    }

    if (!passengerData.gender || !['Male', 'Female', 'Other'].includes(passengerData.gender)) {
      errors.push('Valid gender is required (Male, Female, or Other)');
    }

    if (!passengerData.dob || !this.isValidDate(passengerData.dob)) {
      errors.push('Valid date of birth is required');
    }

    if (passengerData.dob && this.isValidDate(passengerData.dob)) {
      const birthDate = new Date(passengerData.dob);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 0 || age > 120) {
        errors.push('Invalid date of birth');
      }
    }

    if (!passengerData.seat_id || passengerData.seat_id <= 0) {
      errors.push('Valid seat selection is required');
    }

    if (passengerData.weight_limit && (passengerData.weight_limit < 0 || passengerData.weight_limit > 50)) {
      errors.push('Weight limit must be between 0 and 50 kg');
    }

    if (passengerData.booking_id !== undefined && passengerData.booking_id !== 0 && passengerData.booking_id < 0) {
      errors.push('Valid booking ID is required');
    }

    if (!passengerData.flight_id || passengerData.flight_id <= 0) {
      errors.push('Valid flight ID is required');
    }

    return errors;
  }

  private isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  }
}