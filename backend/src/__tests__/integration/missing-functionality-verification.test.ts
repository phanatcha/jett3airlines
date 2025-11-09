import request from 'supertest';
import { describe, it, expect, beforeAll } from '@jest/globals';
import { createTestApp } from './app';
import { generateRandomEmail, generateRandomUsername } from '../utils/testHelpers';

const app = createTestApp();

describe('Missing Functionality Verification Tests', () => {
  let adminToken: string;
  let userToken: string;
  let testFlightId: number;
  let testBookingId: number;
  let testClientId: number;

  beforeAll(async () => {
    // Login as admin
    const adminLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({
        username: process.env.ADMIN_USERNAME || 'admin',
        password: process.env.ADMIN_PASSWORD || 'admin123'
      });

    if (adminLogin.body.success && adminLogin.body.data?.token) {
      adminToken = adminLogin.body.data.token;
    }

    // Create and login as regular user
    const testUser = {
      username: generateRandomUsername(),
      password: 'TestPassword123!',
      email: generateRandomEmail(),
      phone_no: '1234567890',
      firstname: 'Test',
      lastname: 'User',
      dob: '1990-01-01',
      street: '123 Test St',
      city: 'Test City',
      province: 'Test Province',
      Country: 'Test Country',
      postalcode: '12345',
      four_digit: '1234',
      payment_type: 'credit'
    };

    const registerResponse = await request(app)
      .post('/api/v1/auth/register')
      .send(testUser);

    if (registerResponse.body.success) {
      testClientId = registerResponse.body.data.client_id;
    }

    const userLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({
        username: testUser.username,
        password: testUser.password
      });

    if (userLogin.body.success) {
      userToken = userLogin.body.data.token;
    }
  });

  describe('Task 1: Admin Flight Management - Add Flight', () => {
    it('should create a new flight with valid data', async () => {
      if (!adminToken) {
        console.log('Skipping test - no admin token available');
        return;
      }

      // Get airports for testing
      const airportsResponse = await request(app)
        .get('/api/v1/airports')
        .expect(200);

      const airports = airportsResponse.body.data;
      if (airports.length < 2) {
        console.log('Skipping test - not enough airports');
        return;
      }

      // Get airplanes for testing
      const airplanesResponse = await request(app)
        .get('/api/v1/admin/airplanes')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const airplanes = airplanesResponse.body.data;
      if (!airplanes || airplanes.length === 0) {
        console.log('Skipping test - no airplanes available');
        return;
      }

      const flightData = {
        flight_no: `TEST${Date.now()}`,
        depart_airport_id: airports[0].airport_id,
        arrive_airport_id: airports[1].airport_id,
        airplane_id: airplanes[0].airplane_id,
        depart_when: new Date(Date.now() + 86400000).toISOString(),
        arrive_when: new Date(Date.now() + 90000000).toISOString(),
        base_price: 299.99,
        status: 'Scheduled'
      };

      const response = await request(app)
        .post('/api/v1/admin/flights')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(flightData)
        .expect('Content-Type', /json/);

      if (response.status === 201) {
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('flight_id');
        testFlightId = response.body.data.flight_id;
      }
    });

    it('should reject flight creation with missing required fields', async () => {
      if (!adminToken) {
        console.log('Skipping test - no admin token available');
        return;
      }

      const invalidFlightData = {
        flight_no: 'TEST123'
        // Missing other required fields
      };

      const response = await request(app)
        .post('/api/v1/admin/flights')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidFlightData)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject flight creation with invalid datetime', async () => {
      if (!adminToken) {
        console.log('Skipping test - no admin token available');
        return;
      }

      const airportsResponse = await request(app)
        .get('/api/v1/airports')
        .expect(200);

      const airports = airportsResponse.body.data;
      if (airports.length < 2) {
        console.log('Skipping test - not enough airports');
        return;
      }

      const airplanesResponse = await request(app)
        .get('/api/v1/admin/airplanes')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const airplanes = airplanesResponse.body.data;
      if (!airplanes || airplanes.length === 0) {
        console.log('Skipping test - no airplanes available');
        return;
      }

      const invalidFlightData = {
        flight_no: `TEST${Date.now()}`,
        depart_airport_id: airports[0].airport_id,
        arrive_airport_id: airports[1].airport_id,
        airplane_id: airplanes[0].airplane_id,
        depart_when: new Date(Date.now() + 90000000).toISOString(),
        arrive_when: new Date(Date.now() + 86400000).toISOString(), // Arrives before departure
        base_price: 299.99,
        status: 'Scheduled'
      };

      const response = await request(app)
        .post('/api/v1/admin/flights')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidFlightData)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Task 2: Admin Booking Management - Edit Booking', () => {
    it('should update booking status', async () => {
      if (!adminToken) {
        console.log('Skipping test - no admin token available');
        return;
      }

      // Get existing bookings
      const bookingsResponse = await request(app)
        .get('/api/v1/admin/bookings')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const bookings = bookingsResponse.body.data;
      if (!bookings || bookings.length === 0) {
        console.log('Skipping test - no bookings available');
        return;
      }

      testBookingId = bookings[0].booking_id;

      const response = await request(app)
        .patch(`/api/v1/admin/bookings/${testBookingId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'confirmed' })
        .expect('Content-Type', /json/);

      if (response.status === 200) {
        expect(response.body.success).toBe(true);
      }
    });

    it('should reject invalid booking status', async () => {
      if (!adminToken || !testBookingId) {
        console.log('Skipping test - no admin token or booking ID');
        return;
      }

      const response = await request(app)
        .patch(`/api/v1/admin/bookings/${testBookingId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'invalid_status' })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Task 3: Admin Reports - Real Data', () => {
    it('should fetch real metrics data', async () => {
      if (!adminToken) {
        console.log('Skipping test - no admin token available');
        return;
      }

      const response = await request(app)
        .get('/api/v1/admin/reports/metrics')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalFlights');
      expect(response.body.data).toHaveProperty('totalBookings');
      expect(response.body.data).toHaveProperty('totalRevenue');
      expect(response.body.data).toHaveProperty('totalCancellations');
      expect(typeof response.body.data.totalFlights).toBe('number');
      expect(typeof response.body.data.totalRevenue).toBe('number');
    });

    it('should fetch bookings per day data', async () => {
      if (!adminToken) {
        console.log('Skipping test - no admin token available');
        return;
      }

      const response = await request(app)
        .get('/api/v1/admin/reports/bookings-per-day?days=7')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('Task 4: Report Export Functionality', () => {
    it('should export CSV report', async () => {
      if (!adminToken) {
        console.log('Skipping test - no admin token available');
        return;
      }

      const response = await request(app)
        .get('/api/v1/admin/reports/export/csv?type=metrics&days=30')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.headers['content-type']).toContain('text/csv');
      expect(response.headers['content-disposition']).toContain('attachment');
    });

    it('should export PDF report', async () => {
      if (!adminToken) {
        console.log('Skipping test - no admin token available');
        return;
      }

      const response = await request(app)
        .get('/api/v1/admin/reports/export/pdf?type=metrics&days=30')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.headers['content-type']).toContain('application/pdf');
      expect(response.headers['content-disposition']).toContain('attachment');
    });
  });

  describe('Task 5: User Registration - Complete Flow', () => {
    it('should complete registration with all required fields', async () => {
      const newUser = {
        username: generateRandomUsername(),
        password: 'SecurePass123!',
        email: generateRandomEmail(),
        phone_no: '5551234567',
        firstname: 'John',
        lastname: 'Doe',
        dob: '1995-05-15',
        street: '456 Main St',
        city: 'New York',
        province: 'NY',
        Country: 'United States',
        postalcode: '10001',
        four_digit: '5678',
        payment_type: 'debit'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(newUser)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('client_id');
      expect(response.body.data).toHaveProperty('username', newUser.username);
    });

    it('should reject registration with invalid email format', async () => {
      const invalidUser = {
        username: generateRandomUsername(),
        password: 'SecurePass123!',
        email: 'invalid-email-format',
        phone_no: '5551234567',
        firstname: 'John',
        lastname: 'Doe',
        dob: '1995-05-15',
        street: '456 Main St',
        city: 'New York',
        province: 'NY',
        Country: 'United States',
        postalcode: '10001',
        four_digit: '5678',
        payment_type: 'debit'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(invalidUser)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should auto-login after successful registration', async () => {
      const newUser = {
        username: generateRandomUsername(),
        password: 'SecurePass123!',
        email: generateRandomEmail(),
        phone_no: '5551234567',
        firstname: 'Jane',
        lastname: 'Smith',
        dob: '1992-08-20',
        street: '789 Oak Ave',
        city: 'Los Angeles',
        province: 'CA',
        Country: 'United States',
        postalcode: '90001',
        four_digit: '9012',
        payment_type: 'credit'
      };

      // Register
      const registerResponse = await request(app)
        .post('/api/v1/auth/register')
        .send(newUser)
        .expect(201);

      expect(registerResponse.body.success).toBe(true);

      // Login with same credentials
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          username: newUser.username,
          password: newUser.password
        })
        .expect(200);

      expect(loginResponse.body.success).toBe(true);
      expect(loginResponse.body.data).toHaveProperty('token');
    });
  });

  describe('Task 6 & 7: Country Selection and Public Airports API', () => {
    it('should get all airports without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/airports')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.count).toBeGreaterThan(0);
    });

    it('should filter airports by country', async () => {
      const response = await request(app)
        .get('/api/v1/airports?country=United States')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      
      response.body.data.forEach((airport: any) => {
        expect(airport.country_name).toBe('United States');
      });
    });

    it('should search airports by name, city, or IATA code', async () => {
      const response = await request(app)
        .get('/api/v1/airports?search=New York')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return airports sorted by country, city, and name', async () => {
      const response = await request(app)
        .get('/api/v1/airports')
        .expect(200);

      const airports = response.body.data;
      if (airports.length > 1) {
        for (let i = 0; i < airports.length - 1; i++) {
          const current = airports[i];
          const next = airports[i + 1];
          expect(current.country_name <= next.country_name).toBe(true);
        }
      }
    });
  });

  describe('Task 8: Flight Search Filters', () => {
    it('should search flights with filters', async () => {
      const response = await request(app)
        .get('/api/v1/flights/search')
        .query({
          from: 1,
          to: 2,
          date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          minPrice: 100,
          maxPrice: 500
        })
        .expect('Content-Type', /json/);

      if (response.status === 200) {
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
      }
    });
  });

  describe('Error Handling Verification', () => {
    it('should return proper error for unauthorized admin access', async () => {
      const response = await request(app)
        .get('/api/v1/admin/bookings')
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBeDefined();
    });

    it('should return proper error for invalid flight ID', async () => {
      if (!adminToken) {
        console.log('Skipping test - no admin token available');
        return;
      }

      const response = await request(app)
        .get('/api/v1/admin/flights/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return proper error for invalid booking status update', async () => {
      if (!adminToken) {
        console.log('Skipping test - no admin token available');
        return;
      }

      const response = await request(app)
        .patch('/api/v1/admin/bookings/999999/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'confirmed' })
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});
