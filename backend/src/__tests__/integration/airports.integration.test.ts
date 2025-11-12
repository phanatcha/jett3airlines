import request from 'supertest';
import app from './app';

describe('Airports API - Public Endpoints', () => {
  describe('GET /api/v1/airports', () => {
    it('should get all airports without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/airports')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.count).toBeDefined();
      expect(response.body.count).toBeGreaterThan(0);
      
      if (response.body.data.length > 1) {
        const airports = response.body.data;
        for (let i = 0; i < airports.length - 1; i++) {
          const current = airports[i];
          const next = airports[i + 1];
          
          expect(current.country_name <= next.country_name).toBe(true);
          
          if (current.country_name === next.country_name) {
            expect(current.city_name <= next.city_name).toBe(true);
            
            if (current.city_name === next.city_name) {
              expect(current.airport_name <= next.airport_name).toBe(true);
            }
          }
        }
      }
    });

    it('should filter airports by country', async () => {
      const response = await request(app)
        .get('/api/v1/airports?country=United States')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      
      response.body.data.forEach((airport: any) => {
        expect(airport.country_name).toBe('United States');
      });
    });

    it('should search airports by name', async () => {
      const response = await request(app)
        .get('/api/v1/airports?search=London')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      
      response.body.data.forEach((airport: any) => {
        const searchTerm = 'London'.toLowerCase();
        const matchesSearch = 
          airport.city_name.toLowerCase().includes(searchTerm) ||
          airport.airport_name.toLowerCase().includes(searchTerm) ||
          airport.iata_code.toLowerCase().includes(searchTerm) ||
          airport.country_name.toLowerCase().includes(searchTerm);
        
        expect(matchesSearch).toBe(true);
      });
    });

    it('should search airports by IATA code', async () => {
      const response = await request(app)
        .get('/api/v1/airports?search=JFK')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      
      const hasJFK = response.body.data.some((airport: any) => 
        airport.iata_code === 'JFK'
      );
      expect(hasJFK).toBe(true);
    });

    it('should return empty array for non-existent country', async () => {
      const response = await request(app)
        .get('/api/v1/airports?country=NonExistentCountry')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(0);
      expect(response.body.count).toBe(0);
    });

    it('should handle errors gracefully', async () => {
      const response = await request(app)
        .get('/api/v1/airports?search=')
        .expect('Content-Type', /json/);

      expect(response.body.success).toBeDefined();
    });
  });
});
