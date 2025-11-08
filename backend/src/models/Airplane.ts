import { BaseModel } from './BaseModel';
import { Airplane } from '../types/database';

export class AirplaneModel extends BaseModel {
  constructor() {
    super('airplane');
  }

  // Find airplane by ID
  async findAirplaneById(airplaneId: number): Promise<Airplane | null> {
    return await super.findById<Airplane>(airplaneId, 'airplane_id');
  }

  // Find airplane by registration
  async findByRegistration(registration: string): Promise<Airplane | null> {
    try {
      const query = 'SELECT * FROM airplane WHERE registration = ? LIMIT 1';
      const results = await this.executeQuery<Airplane>(query, [registration]);
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error('Error finding airplane by registration:', error);
      throw error;
    }
  }

  // Get all airplanes
  async getAllAirplanes(limit?: number, offset?: number) {
    try {
      return await this.findAll<Airplane>({}, limit, offset, 'type, registration');
    } catch (error) {
      console.error('Error getting all airplanes:', error);
      throw error;
    }
  }

  // Get airplane with detailed information including seat configuration
  async getAirplaneDetails(airplaneId: number) {
    try {
      const query = `
        SELECT 
          a.*,
          COUNT(s.seat_id) as total_seats,
          COUNT(CASE WHEN s.class = 'FIRSTCLASS' THEN 1 END) as first_class_seats,
          COUNT(CASE WHEN s.class = 'Business' THEN 1 END) as business_seats,
          COUNT(CASE WHEN s.class IN ('PREMIUM_ECONOMY', 'Premium Economy') THEN 1 END) as premium_economy_seats,
          COUNT(CASE WHEN s.class IN ('ECONOMY', 'Economy') THEN 1 END) as economy_seats,
          MIN(s.price) as min_seat_price,
          MAX(s.price) as max_seat_price,
          AVG(s.price) as avg_seat_price
        FROM airplane a
        LEFT JOIN seat s ON a.airplane_id = s.airplane_id
        WHERE a.airplane_id = ?
        GROUP BY a.airplane_id
      `;
      
      const results = await this.executeQuery(query, [airplaneId]);
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error('Error getting airplane details:', error);
      throw error;
    }
  }

  // Get airplanes by type
  async getAirplanesByType(type: string) {
    try {
      const query = `
        SELECT * FROM airplane 
        WHERE type LIKE ?
        ORDER BY registration
      `;

      return await this.executeQuery(query, [`%${type}%`]);
    } catch (error) {
      console.error('Error getting airplanes by type:', error);
      throw error;
    }
  }

  // Get airplanes by country
  async getAirplanesByCountry(country: string) {
    try {
      const query = `
        SELECT * FROM airplane 
        WHERE reg_country = ?
        ORDER BY type, registration
      `;

      return await this.executeQuery(query, [country]);
    } catch (error) {
      console.error('Error getting airplanes by country:', error);
      throw error;
    }
  }

  // Get airplane utilization statistics
  async getAirplaneUtilization(airplaneId: number, days: number = 30) {
    try {
      const query = `
        SELECT 
          a.*,
          COUNT(f.flight_id) as flights_count,
          COUNT(CASE WHEN f.status = 'Scheduled' THEN 1 END) as scheduled_flights,
          COUNT(CASE WHEN f.status = 'Completed' THEN 1 END) as completed_flights,
          COUNT(CASE WHEN f.status = 'Cancelled' THEN 1 END) as cancelled_flights,
          AVG(
            TIMESTAMPDIFF(MINUTE, f.depart_when, f.arrive_when)
          ) as avg_flight_duration_minutes,
          SUM(
            TIMESTAMPDIFF(MINUTE, f.depart_when, f.arrive_when)
          ) as total_flight_time_minutes
        FROM airplane a
        LEFT JOIN flight f ON a.airplane_id = f.airplane_id 
          AND f.depart_when >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
        WHERE a.airplane_id = ?
        GROUP BY a.airplane_id
      `;

      const results = await this.executeQuery(query, [days, airplaneId]);
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error('Error getting airplane utilization:', error);
      throw error;
    }
  }

  // Get airplane fleet statistics
  async getFleetStatistics() {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_airplanes,
          COUNT(DISTINCT type) as unique_types,
          COUNT(DISTINCT reg_country) as unique_countries,
          AVG(capacity) as avg_capacity,
          MIN(capacity) as min_capacity,
          MAX(capacity) as max_capacity,
          SUM(capacity) as total_capacity,
          AVG(min_price) as avg_min_price,
          MIN(min_price) as lowest_min_price,
          MAX(min_price) as highest_min_price,
          AVG(YEAR(CURDATE()) - YEAR(manufacturing_year)) as avg_age_years
        FROM airplane
      `;

      const result = await this.executeQuery(query);
      return result[0];
    } catch (error) {
      console.error('Error getting fleet statistics:', error);
      throw error;
    }
  }

  // Get airplane types with counts
  async getAirplaneTypes() {
    try {
      const query = `
        SELECT 
          type,
          COUNT(*) as count,
          AVG(capacity) as avg_capacity,
          AVG(min_price) as avg_min_price,
          MIN(manufacturing_year) as oldest_year,
          MAX(manufacturing_year) as newest_year
        FROM airplane
        GROUP BY type
        ORDER BY count DESC, type
      `;

      return await this.executeQuery(query);
    } catch (error) {
      console.error('Error getting airplane types:', error);
      throw error;
    }
  }

  // Get available airplanes for a time period
  async getAvailableAirplanes(startTime: string, endTime: string) {
    try {
      const query = `
        SELECT a.*
        FROM airplane a
        WHERE a.airplane_id NOT IN (
          SELECT DISTINCT f.airplane_id
          FROM flight f
          WHERE f.airplane_id IS NOT NULL
            AND (
              (f.depart_when BETWEEN ? AND ?) OR
              (f.arrive_when BETWEEN ? AND ?) OR
              (f.depart_when <= ? AND f.arrive_when >= ?)
            )
            AND f.status NOT IN ('Cancelled')
        )
        ORDER BY a.type, a.registration
      `;

      return await this.executeQuery(query, [
        startTime, endTime, 
        startTime, endTime, 
        startTime, endTime
      ]);
    } catch (error) {
      console.error('Error getting available airplanes:', error);
      throw error;
    }
  }

  // Create new airplane (admin function)
  async createAirplane(airplaneData: Omit<Airplane, 'airplane_id'>): Promise<number> {
    try {
      return await this.create(airplaneData as any);
    } catch (error) {
      console.error('Error creating airplane:', error);
      throw error;
    }
  }

  // Update airplane information (admin function)
  async updateAirplane(airplaneId: number, updateData: Partial<Airplane>): Promise<boolean> {
    try {
      return await this.update<Airplane>(airplaneId, updateData, 'airplane_id');
    } catch (error) {
      console.error('Error updating airplane:', error);
      throw error;
    }
  }

  // Delete airplane (admin function)
  async deleteAirplane(airplaneId: number): Promise<boolean> {
    try {
      // Check if airplane has any flights
      const flightCount = await this.executeQuery(
        'SELECT COUNT(*) as count FROM flight WHERE airplane_id = ?',
        [airplaneId]
      );

      if ((flightCount[0] as any).count > 0) {
        throw new Error('Cannot delete airplane with existing flights');
      }

      // Check if airplane has any seats
      const seatCount = await this.executeQuery(
        'SELECT COUNT(*) as count FROM seat WHERE airplane_id = ?',
        [airplaneId]
      );

      if ((seatCount[0] as any).count > 0) {
        throw new Error('Cannot delete airplane with existing seat configuration');
      }

      return await this.delete(airplaneId, 'airplane_id');
    } catch (error) {
      console.error('Error deleting airplane:', error);
      throw error;
    }
  }

  // Check if registration exists
  async registrationExists(registration: string, excludeAirplaneId?: number): Promise<boolean> {
    try {
      let query = 'SELECT COUNT(*) as count FROM airplane WHERE registration = ?';
      const params: any[] = [registration];

      if (excludeAirplaneId) {
        query += ' AND airplane_id != ?';
        params.push(excludeAirplaneId);
      }

      const result = await this.executeQuery<{ count: number }>(query, params as any);
      return result[0].count > 0;
    } catch (error) {
      console.error('Error checking registration existence:', error);
      throw error;
    }
  }

  // Get airplane maintenance schedule (placeholder for future implementation)
  async getMaintenanceSchedule(airplaneId: number) {
    try {
      // This would integrate with a maintenance system
      // For now, return basic information
      const airplane = await this.findAirplaneById(airplaneId);
      if (!airplane) return null;

      const currentYear = new Date().getFullYear();
      const manufacturingYear = new Date(airplane.manufacturing_year).getFullYear();
      const age = currentYear - manufacturingYear;

      return {
        airplane_id: airplaneId,
        age_years: age,
        next_maintenance_due: 'TBD', // Would be calculated based on flight hours/cycles
        maintenance_status: age > 10 ? 'Due Soon' : 'Current',
        last_maintenance: 'TBD' // Would come from maintenance records
      };
    } catch (error) {
      console.error('Error getting maintenance schedule:', error);
      throw error;
    }
  }

  // Search airplanes
  async searchAirplanes(searchTerm: string, limit: number = 20) {
    try {
      const query = `
        SELECT * FROM airplane 
        WHERE type LIKE ? 
           OR registration LIKE ? 
           OR reg_country LIKE ?
           OR MSN LIKE ?
        ORDER BY type, registration
        LIMIT ?
      `;

      const searchPattern = `%${searchTerm}%`;
      return await this.executeQuery(query, [
        searchPattern, 
        searchPattern, 
        searchPattern,
        searchPattern,
        limit
      ]);
    } catch (error) {
      console.error('Error searching airplanes:', error);
      throw error;
    }
  }

  // Validate airplane data
  validateAirplaneData(airplaneData: any): string[] {
    const errors: string[] = [];

    if (!airplaneData.type || airplaneData.type.trim().length === 0) {
      errors.push('Aircraft type is required');
    }

    if (!airplaneData.registration || airplaneData.registration.trim().length === 0) {
      errors.push('Registration is required');
    }

    if (airplaneData.registration && !/^[A-Z0-9-]+$/.test(airplaneData.registration.toUpperCase())) {
      errors.push('Registration must contain only letters, numbers, and hyphens');
    }

    if (!airplaneData.reg_country || airplaneData.reg_country.trim().length === 0) {
      errors.push('Registration country is required');
    }

    if (!airplaneData.MSN || airplaneData.MSN.trim().length === 0) {
      errors.push('Manufacturer Serial Number (MSN) is required');
    }

    if (!airplaneData.manufacturing_year || !this.isValidDate(airplaneData.manufacturing_year)) {
      errors.push('Valid manufacturing year is required');
    }

    if (airplaneData.manufacturing_year && this.isValidDate(airplaneData.manufacturing_year)) {
      const manufacturingYear = new Date(airplaneData.manufacturing_year).getFullYear();
      const currentYear = new Date().getFullYear();
      
      if (manufacturingYear < 1950 || manufacturingYear > currentYear + 2) {
        errors.push('Manufacturing year must be between 1950 and current year + 2');
      }
    }

    if (!airplaneData.capacity || airplaneData.capacity <= 0) {
      errors.push('Valid capacity is required');
    }

    if (airplaneData.capacity && (airplaneData.capacity < 1 || airplaneData.capacity > 1000)) {
      errors.push('Capacity must be between 1 and 1000');
    }

    if (!airplaneData.min_price || airplaneData.min_price <= 0) {
      errors.push('Valid minimum price is required');
    }

    return errors;
  }

  // Helper method to validate date format
  private isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  }
}