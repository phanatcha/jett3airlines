import { BaseModel } from './BaseModel';
import { Baggage, CreateBaggage, BaggageStatus } from '../types/database';

export class BaggageModel extends BaseModel {
  constructor() {
    super('baggage');
  }

  // Find baggage by ID
  async findBaggageById(baggageId: number): Promise<Baggage | null> {
    return await super.findById<Baggage>(baggageId, 'baggage_id');
  }

  // Find baggage by tracking number
  async findByTrackingNumber(trackingNo: string): Promise<Baggage | null> {
    try {
      const query = 'SELECT * FROM baggage WHERE tracking_no = ? LIMIT 1';
      const results = await this.executeQuery<Baggage>(query, [trackingNo]);
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error('Error finding baggage by tracking number:', error);
      throw error;
    }
  }

  // Get baggage with detailed information
  async getBaggageDetails(baggageId: number) {
    try {
      const query = `
        SELECT 
          b.*,
          p.firstname as passenger_firstname,
          p.lastname as passenger_lastname,
          p.nationality,
          f.flight_id,
          f.depart_when,
          f.arrive_when,
          dep_airport.airport_name as departure_airport,
          dep_airport.city_name as departure_city,
          dep_airport.iata_code as departure_iata,
          arr_airport.airport_name as arrival_airport,
          arr_airport.city_name as arrival_city,
          arr_airport.iata_code as arrival_iata,
          bk.booking_id,
          c.firstname as client_firstname,
          c.lastname as client_lastname,
          c.email as client_email
        FROM baggage b
        LEFT JOIN passenger p ON b.passenger_id = p.passenger_id
        LEFT JOIN flight f ON p.flight_id = f.flight_id
        LEFT JOIN airport dep_airport ON f.depart_airport_id = dep_airport.airport_id
        LEFT JOIN airport arr_airport ON f.arrive_airport_id = arr_airport.airport_id
        LEFT JOIN booking bk ON p.booking_id = bk.booking_id
        LEFT JOIN client c ON bk.client_id = c.client_id
        WHERE b.baggage_id = ?
      `;
      
      const results = await this.executeQuery(query, [baggageId]);
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error('Error getting baggage details:', error);
      throw error;
    }
  }

  // Get baggage by passenger ID
  async getBaggageByPassenger(passengerId: number) {
    try {
      const query = `
        SELECT 
          b.*,
          p.firstname as passenger_firstname,
          p.lastname as passenger_lastname
        FROM baggage b
        LEFT JOIN passenger p ON b.passenger_id = p.passenger_id
        WHERE b.passenger_id = ?
        ORDER BY b.baggage_id
      `;

      return await this.executeQuery(query, [passengerId]);
    } catch (error) {
      console.error('Error getting baggage by passenger:', error);
      throw error;
    }
  }

  // Get baggage by flight ID
  async getBaggageByFlight(flightId: number) {
    try {
      const query = `
        SELECT 
          b.*,
          p.firstname as passenger_firstname,
          p.lastname as passenger_lastname,
          p.nationality,
          s.seat_no
        FROM baggage b
        LEFT JOIN passenger p ON b.passenger_id = p.passenger_id
        LEFT JOIN seat s ON p.seat_id = s.seat_id
        WHERE p.flight_id = ?
        ORDER BY p.passenger_id, b.baggage_id
      `;

      return await this.executeQuery(query, [flightId]);
    } catch (error) {
      console.error('Error getting baggage by flight:', error);
      throw error;
    }
  }

  // Create new baggage record
  async createBaggage(baggageData: CreateBaggage): Promise<number> {
    try {
      // Generate tracking number if not provided
      if (!baggageData.tracking_no) {
        baggageData.tracking_no = this.generateTrackingNumber();
      }

      return await this.create(baggageData as any);
    } catch (error) {
      console.error('Error creating baggage:', error);
      throw error;
    }
  }

  // Update baggage status
  async updateBaggageStatus(baggageId: number, status: BaggageStatus): Promise<boolean> {
    try {
      return await this.update<Baggage>(baggageId, { status }, 'baggage_id');
    } catch (error) {
      console.error('Error updating baggage status:', error);
      throw error;
    }
  }

  // Update baggage status by tracking number
  async updateBaggageStatusByTracking(trackingNo: string, status: BaggageStatus): Promise<boolean> {
    try {
      const query = 'UPDATE baggage SET status = ? WHERE tracking_no = ?';
      const result = await this.executeQuery(query, [status, trackingNo]);
      return (result as any).affectedRows > 0;
    } catch (error) {
      console.error('Error updating baggage status by tracking:', error);
      throw error;
    }
  }

  // Track baggage by tracking number
  async trackBaggage(trackingNo: string) {
    try {
      const query = `
        SELECT 
          b.*,
          p.firstname as passenger_firstname,
          p.lastname as passenger_lastname,
          f.flight_id,
          f.depart_when,
          f.arrive_when,
          f.status as flight_status,
          dep_airport.airport_name as departure_airport,
          dep_airport.city_name as departure_city,
          dep_airport.iata_code as departure_iata,
          arr_airport.airport_name as arrival_airport,
          arr_airport.city_name as arrival_city,
          arr_airport.iata_code as arrival_iata
        FROM baggage b
        LEFT JOIN passenger p ON b.passenger_id = p.passenger_id
        LEFT JOIN flight f ON p.flight_id = f.flight_id
        LEFT JOIN airport dep_airport ON f.depart_airport_id = dep_airport.airport_id
        LEFT JOIN airport arr_airport ON f.arrive_airport_id = arr_airport.airport_id
        WHERE b.tracking_no = ?
      `;

      const results = await this.executeQuery(query, [trackingNo]);
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error('Error tracking baggage:', error);
      throw error;
    }
  }

  // Get baggage statistics
  async getBaggageStats() {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_baggage,
          COUNT(CASE WHEN status = 'checked_in' THEN 1 END) as checked_in_count,
          COUNT(CASE WHEN status = 'in_transit' THEN 1 END) as in_transit_count,
          COUNT(CASE WHEN status = 'arrived' THEN 1 END) as arrived_count,
          COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_count,
          COUNT(CASE WHEN status = 'lost' THEN 1 END) as lost_count,
          COUNT(DISTINCT passenger_id) as unique_passengers
        FROM baggage
      `;

      const result = await this.executeQuery(query);
      return result[0];
    } catch (error) {
      console.error('Error getting baggage statistics:', error);
      throw error;
    }
  }

  // Get baggage by status
  async getBaggageByStatus(status: BaggageStatus, limit?: number, offset?: number) {
    try {
      let query = `
        SELECT 
          b.*,
          p.firstname as passenger_firstname,
          p.lastname as passenger_lastname,
          f.flight_id,
          dep_airport.iata_code as departure_iata,
          arr_airport.iata_code as arrival_iata,
          f.depart_when
        FROM baggage b
        LEFT JOIN passenger p ON b.passenger_id = p.passenger_id
        LEFT JOIN flight f ON p.flight_id = f.flight_id
        LEFT JOIN airport dep_airport ON f.depart_airport_id = dep_airport.airport_id
        LEFT JOIN airport arr_airport ON f.arrive_airport_id = arr_airport.airport_id
        WHERE b.status = ?
        ORDER BY f.depart_when DESC
      `;

      const params: any[] = [status];

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
      console.error('Error getting baggage by status:', error);
      throw error;
    }
  }

  // Search baggage by passenger name or tracking number
  async searchBaggage(searchTerm: string, limit: number = 50) {
    try {
      const query = `
        SELECT 
          b.*,
          p.firstname as passenger_firstname,
          p.lastname as passenger_lastname,
          f.flight_id,
          dep_airport.iata_code as departure_iata,
          arr_airport.iata_code as arrival_iata,
          f.depart_when
        FROM baggage b
        LEFT JOIN passenger p ON b.passenger_id = p.passenger_id
        LEFT JOIN flight f ON p.flight_id = f.flight_id
        LEFT JOIN airport dep_airport ON f.depart_airport_id = dep_airport.airport_id
        LEFT JOIN airport arr_airport ON f.arrive_airport_id = arr_airport.airport_id
        WHERE b.tracking_no LIKE ? 
           OR CONCAT(p.firstname, ' ', p.lastname) LIKE ?
        ORDER BY f.depart_when DESC
        LIMIT ?
      `;

      const searchPattern = `%${searchTerm}%`;
      return await this.executeQuery(query, [searchPattern, searchPattern, limit]);
    } catch (error) {
      console.error('Error searching baggage:', error);
      throw error;
    }
  }

  // Get lost baggage report
  async getLostBaggageReport(days: number = 30) {
    try {
      const query = `
        SELECT 
          b.*,
          p.firstname as passenger_firstname,
          p.lastname as passenger_lastname,
          p.nationality,
          f.flight_id,
          f.depart_when,
          dep_airport.airport_name as departure_airport,
          dep_airport.iata_code as departure_iata,
          arr_airport.airport_name as arrival_airport,
          arr_airport.iata_code as arrival_iata,
          c.firstname as client_firstname,
          c.lastname as client_lastname,
          c.email as client_email,
          c.phone_no as client_phone
        FROM baggage b
        LEFT JOIN passenger p ON b.passenger_id = p.passenger_id
        LEFT JOIN flight f ON p.flight_id = f.flight_id
        LEFT JOIN airport dep_airport ON f.depart_airport_id = dep_airport.airport_id
        LEFT JOIN airport arr_airport ON f.arrive_airport_id = arr_airport.airport_id
        LEFT JOIN booking bk ON p.booking_id = bk.booking_id
        LEFT JOIN client c ON bk.client_id = c.client_id
        WHERE b.status = 'lost' 
          AND f.depart_when >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
        ORDER BY f.depart_when DESC
      `;

      return await this.executeQuery(query, [days]);
    } catch (error) {
      console.error('Error getting lost baggage report:', error);
      throw error;
    }
  }

  // Delete baggage record (admin function)
  async deleteBaggage(baggageId: number): Promise<boolean> {
    return await this.delete(baggageId, 'baggage_id');
  }

  // Check if tracking number exists
  async trackingNumberExists(trackingNo: string, excludeBaggageId?: number): Promise<boolean> {
    try {
      let query = 'SELECT COUNT(*) as count FROM baggage WHERE tracking_no = ?';
      const params: any[] = [trackingNo];

      if (excludeBaggageId) {
        query += ' AND baggage_id != ?';
        params.push(excludeBaggageId);
      }

      const result = await this.executeQuery<{ count: number }>(query, params as any);
      return result[0].count > 0;
    } catch (error) {
      console.error('Error checking tracking number existence:', error);
      throw error;
    }
  }

  // Generate unique tracking number
  private generateTrackingNumber(): string {
    const prefix = 'JT3'; // Airline code
    const timestamp = Date.now().toString().slice(-8); // Last 8 digits of timestamp
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
  }

  // Validate baggage data
  validateBaggageData(baggageData: any): string[] {
    const errors: string[] = [];

    if (baggageData.tracking_no && baggageData.tracking_no.trim().length === 0) {
      errors.push('Tracking number cannot be empty if provided');
    }

    if (baggageData.tracking_no && baggageData.tracking_no.length > 50) {
      errors.push('Tracking number cannot exceed 50 characters');
    }

    if (!baggageData.status || baggageData.status.trim().length === 0) {
      errors.push('Baggage status is required');
    }

    const validStatuses = ['checked_in', 'in_transit', 'arrived', 'delivered', 'lost'];
    if (baggageData.status && !validStatuses.includes(baggageData.status)) {
      errors.push('Invalid baggage status');
    }

    if (!baggageData.passenger_id || baggageData.passenger_id <= 0) {
      errors.push('Valid passenger ID is required');
    }

    return errors;
  }
}