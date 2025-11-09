import { BaseModel } from './BaseModel';
import { Airport } from '../types/database';

export class AirportModel extends BaseModel {
  constructor() {
    super('airport');
  }

  // Find airport by ID
  async findAirportById(airportId: number): Promise<Airport | null> {
    return await super.findById<Airport>(airportId, 'airport_id');
  }

  // Find airport by IATA code
  async findByIataCode(iataCode: string): Promise<Airport | null> {
    try {
      const query = 'SELECT * FROM airport WHERE iata_code = ? LIMIT 1';
      const results = await this.executeQuery<Airport>(query, [iataCode.toUpperCase()]);
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error('Error finding airport by IATA code:', error);
      throw error;
    }
  }

  // Get all airports
  async getAllAirports(limit?: number, offset?: number) {
    try {
      return await this.findAll<Airport>({}, limit, offset, 'country_name, city_name, airport_name');
    } catch (error) {
      console.error('Error getting all airports:', error);
      throw error;
    }
  }

  // Search airports by city or airport name
  async searchAirports(searchTerm: string, limit: number = 20) {
    try {
      const query = `
        SELECT * FROM airport 
        WHERE city_name LIKE ? 
           OR airport_name LIKE ? 
           OR iata_code LIKE ?
           OR country_name LIKE ?
        ORDER BY country_name, city_name, airport_name
        LIMIT ?
      `;

      const searchPattern = `%${searchTerm}%`;
      return await this.executeQuery(query, [
        searchPattern, 
        searchPattern, 
        searchPattern.toUpperCase(),
        searchPattern,
        limit
      ]);
    } catch (error) {
      console.error('Error searching airports:', error);
      throw error;
    }
  }

  // Get airports by country
  async getAirportsByCountry(countryName: string) {
    try {
      const query = `
        SELECT * FROM airport 
        WHERE country_name = ?
        ORDER BY country_name, city_name, airport_name
      `;

      return await this.executeQuery(query, [countryName]);
    } catch (error) {
      console.error('Error getting airports by country:', error);
      throw error;
    }
  }

  // Get airports by city
  async getAirportsByCity(cityName: string) {
    try {
      const query = `
        SELECT * FROM airport 
        WHERE city_name = ?
        ORDER BY airport_name
      `;

      return await this.executeQuery(query, [cityName]);
    } catch (error) {
      console.error('Error getting airports by city:', error);
      throw error;
    }
  }

  // Get airport with flight statistics
  async getAirportWithStats(airportId: number) {
    try {
      const query = `
        SELECT 
          a.*,
          COUNT(DISTINCT f_dep.flight_id) as departure_flights,
          COUNT(DISTINCT f_arr.flight_id) as arrival_flights,
          COUNT(DISTINCT f_dep.flight_id) + COUNT(DISTINCT f_arr.flight_id) as total_flights
        FROM airport a
        LEFT JOIN flight f_dep ON a.airport_id = f_dep.depart_airport_id
        LEFT JOIN flight f_arr ON a.airport_id = f_arr.arrive_airport_id
        WHERE a.airport_id = ?
        GROUP BY a.airport_id
      `;

      const results = await this.executeQuery(query, [airportId]);
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error('Error getting airport with stats:', error);
      throw error;
    }
  }

  // Get popular routes from an airport
  async getPopularRoutesFromAirport(airportId: number, limit: number = 10) {
    try {
      const query = `
        SELECT 
          arr_airport.airport_id as destination_airport_id,
          arr_airport.city_name as destination_city,
          arr_airport.airport_name as destination_airport,
          arr_airport.iata_code as destination_iata,
          arr_airport.country_name as destination_country,
          COUNT(f.flight_id) as flight_count,
          MIN(a.min_price) as min_price
        FROM flight f
        LEFT JOIN airport arr_airport ON f.arrive_airport_id = arr_airport.airport_id
        LEFT JOIN airplane a ON f.airplane_id = a.airplane_id
        WHERE f.depart_airport_id = ?
        GROUP BY arr_airport.airport_id
        ORDER BY flight_count DESC
        LIMIT ?
      `;

      return await this.executeQuery(query, [airportId, limit]);
    } catch (error) {
      console.error('Error getting popular routes from airport:', error);
      throw error;
    }
  }

  // Get popular routes to an airport
  async getPopularRoutesToAirport(airportId: number, limit: number = 10) {
    try {
      const query = `
        SELECT 
          dep_airport.airport_id as origin_airport_id,
          dep_airport.city_name as origin_city,
          dep_airport.airport_name as origin_airport,
          dep_airport.iata_code as origin_iata,
          dep_airport.country_name as origin_country,
          COUNT(f.flight_id) as flight_count,
          MIN(a.min_price) as min_price
        FROM flight f
        LEFT JOIN airport dep_airport ON f.depart_airport_id = dep_airport.airport_id
        LEFT JOIN airplane a ON f.airplane_id = a.airplane_id
        WHERE f.arrive_airport_id = ?
        GROUP BY dep_airport.airport_id
        ORDER BY flight_count DESC
        LIMIT ?
      `;

      return await this.executeQuery(query, [airportId, limit]);
    } catch (error) {
      console.error('Error getting popular routes to airport:', error);
      throw error;
    }
  }

  // Get unique countries
  async getUniqueCountries() {
    try {
      const query = `
        SELECT DISTINCT country_name 
        FROM airport 
        ORDER BY country_name
      `;

      return await this.executeQuery(query);
    } catch (error) {
      console.error('Error getting unique countries:', error);
      throw error;
    }
  }

  // Get unique cities
  async getUniqueCities() {
    try {
      const query = `
        SELECT DISTINCT city_name, country_name 
        FROM airport 
        ORDER BY city_name
      `;

      return await this.executeQuery(query);
    } catch (error) {
      console.error('Error getting unique cities:', error);
      throw error;
    }
  }

  // Create new airport (admin function)
  async createAirport(airportData: Omit<Airport, 'airport_id'>): Promise<number> {
    try {
      // Ensure IATA code is uppercase
      const createData = {
        ...airportData,
        iata_code: airportData.iata_code.toUpperCase()
      };

      return await this.create(createData as any);
    } catch (error) {
      console.error('Error creating airport:', error);
      throw error;
    }
  }

  // Update airport information (admin function)
  async updateAirport(airportId: number, updateData: Partial<Airport>): Promise<boolean> {
    try {
      // Ensure IATA code is uppercase if being updated
      if (updateData.iata_code) {
        updateData.iata_code = updateData.iata_code.toUpperCase();
      }

      return await this.update<Airport>(airportId, updateData, 'airport_id');
    } catch (error) {
      console.error('Error updating airport:', error);
      throw error;
    }
  }

  // Delete airport (admin function)
  async deleteAirport(airportId: number): Promise<boolean> {
    try {
      // Check if airport has any flights
      const flightCount = await this.executeQuery(
        'SELECT COUNT(*) as count FROM flight WHERE depart_airport_id = ? OR arrive_airport_id = ?',
        [airportId, airportId]
      );

      if ((flightCount[0] as any).count > 0) {
        throw new Error('Cannot delete airport with existing flights');
      }

      return await this.delete(airportId, 'airport_id');
    } catch (error) {
      console.error('Error deleting airport:', error);
      throw error;
    }
  }

  // Check if IATA code exists
  async iataCodeExists(iataCode: string, excludeAirportId?: number): Promise<boolean> {
    try {
      let query = 'SELECT COUNT(*) as count FROM airport WHERE iata_code = ?';
      const params: any[] = [iataCode.toUpperCase()];

      if (excludeAirportId) {
        query += ' AND airport_id != ?';
        params.push(excludeAirportId);
      }

      const result = await this.executeQuery<{ count: number }>(query, params as any);
      return result[0].count > 0;
    } catch (error) {
      console.error('Error checking IATA code existence:', error);
      throw error;
    }
  }

  // Get airport statistics
  async getAirportStats() {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_airports,
          COUNT(DISTINCT country_name) as unique_countries,
          COUNT(DISTINCT city_name) as unique_cities,
          (SELECT COUNT(*) FROM flight WHERE depart_airport_id IN (SELECT airport_id FROM airport)) as total_departures,
          (SELECT COUNT(*) FROM flight WHERE arrive_airport_id IN (SELECT airport_id FROM airport)) as total_arrivals
        FROM airport
      `;

      const result = await this.executeQuery(query);
      return result[0];
    } catch (error) {
      console.error('Error getting airport statistics:', error);
      throw error;
    }
  }

  // Get busiest airports by flight count
  async getBusiestAirports(limit: number = 10) {
    try {
      const query = `
        SELECT 
          a.*,
          COUNT(DISTINCT f_dep.flight_id) as departure_count,
          COUNT(DISTINCT f_arr.flight_id) as arrival_count,
          COUNT(DISTINCT f_dep.flight_id) + COUNT(DISTINCT f_arr.flight_id) as total_flights
        FROM airport a
        LEFT JOIN flight f_dep ON a.airport_id = f_dep.depart_airport_id
        LEFT JOIN flight f_arr ON a.airport_id = f_arr.arrive_airport_id
        GROUP BY a.airport_id
        ORDER BY total_flights DESC
        LIMIT ?
      `;

      return await this.executeQuery(query, [limit]);
    } catch (error) {
      console.error('Error getting busiest airports:', error);
      throw error;
    }
  }

  // Validate airport data
  validateAirportData(airportData: any): string[] {
    const errors: string[] = [];

    if (!airportData.city_name || airportData.city_name.trim().length === 0) {
      errors.push('City name is required');
    }

    if (!airportData.airport_name || airportData.airport_name.trim().length === 0) {
      errors.push('Airport name is required');
    }

    if (!airportData.iata_code || airportData.iata_code.trim().length !== 3) {
      errors.push('IATA code must be exactly 3 characters');
    }

    if (airportData.iata_code && !/^[A-Z]{3}$/.test(airportData.iata_code.toUpperCase())) {
      errors.push('IATA code must contain only letters');
    }

    if (!airportData.country_name || airportData.country_name.trim().length === 0) {
      errors.push('Country name is required');
    }

    return errors;
  }
}