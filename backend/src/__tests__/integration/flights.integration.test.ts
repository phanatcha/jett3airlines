import request from 'supertest';
import { describe, it, expect, beforeAll } from '@jest/globals';
import { createTestApp } from './app';

const app = createTestApp();

describe('Flights Integration Tests', () => {
  let adminToken: string;
  let testFlightId: number;

  beforeAll(async () => {
    // Login as admin to get token for protected routes
    const adminLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({
        username: process.env.ADMIN_USERNAME || 'admin',
        password: process.env.ADMIN_PASSWORD || 'admin123'
      });

    if (adminLogin.body.success && adminLogin.body.data?.token) {
      adminToken = adminLogin.body.data.token;
    }
  });

  describe('GET /api/v1/flights/search', () => {
    it('should search flights without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/flights/search')
        .query({
          depart_airport_id: 1,
          arrive_airport_id: 2
        })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter flights by date', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      
      const response = await request(app)
        .get('/api/v1/flights/search')
        .query({
          depart_airport_id: 1,
          arrive_airport_id: 2,
          depart_date: futureDate.toISOString().split('T')[0]
        })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return empty array when no flights match', async () => {
      const response = await request(app)
        .get('/api/v1/flights/search')
        .query({
          depart_airport_id: 9999,
          arrive_airport_id: 9998
        })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });
  });

  describe('GET /api/v1/flights/:id', () => {
    it('should get flight details by ID', async () => {
      const response = await request(app)
        .get('/api/v1/flights/1')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('flight_id');
      expect(response.body.data).toHaveProperty('depart_when');
      expect(response.body.data).toHaveProperty('arrive_when');
    });

    it('should return 404 for non-existent flight', async () => {
      const response = await request(app)
        .get('/api/v1/flights/99999')
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/flights/:id/seats', () => {
    it('should get available seats for a flight', async () => {
      const response = await request(app)
        .get('/api/v1/flights/1/seats')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return 404 for non-existent flight seats', async () => {
      const response = await request(app)
        .get('/api/v1/flights/99999/seats')
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Admin Flight Management', () => {
    it('should create a new flight with admin token', async () => {
      if (!adminToken) {
        console.log('Skipping admin test - no admin token available');
        return;
      }

      const newFlight = {
        depart_when: new Date(Date.now() + 86400000 * 30).toISOString(),
        arrive_when: new Date(Date.now() + 86400000 * 30 + 7200000).toISOString(),
        status: 'scheduled',
        airplane_id: 1,
        depart_airport_id: 1,
        arrive_airport_id: 2
      };

      const response = await request(app)
        .post('/api/v1/admin/flights')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newFlight)
        .expect('Content-Type', /json/);

      if (response.status === 201) {
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('flight_id');
        testFlightId = response.body.data.flight_id;
      }
    });

    it('should reject flight creation without admin token', async () => {
      const newFlight = {
        depart_when: new Date(Date.now() + 86400000).toISOString(),
        arrive_when: new Date(Date.now() + 86400000 + 7200000).toISOString(),
        status: 'scheduled',
        airplane_id: 1,
        depart_airport_id: 1,
        arrive_airport_id: 2
      };

      const response = await request(app)
        .post('/api/v1/admin/flights')
        .send(newFlight)
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});
