/**
 * End-to-End Test Suite for Complete Airline Booking Workflow
 * Tests the entire user journey from registration to booking completion
 */

import request from 'supertest';
import { createTestApp } from '../integration/app';
import database from '../../db';

const app = createTestApp();

describe('Complete Airline Booking Workflow E2E Tests', () => {
  let authToken: string;
  let clientId: number;
  let flightId: number;
  let bookingId: number;
  let paymentId: number;

  // Cleanup after all tests
  afterAll(async () => {
    await database.close();
  });

  describe('1. User Registration and Authentication Flow', () => {
    const testUser = {
      username: `e2e_user_${Date.now()}`,
      password: 'SecurePass123!',
      email: `e2e_${Date.now()}@test.com`,
      phone_no: '1234567890',
      firstname: 'E2E',
      lastname: 'Test',
      dob: '1990-01-01',
      street: '123 Test St',
      city: 'Test City',
      province: 'Test Province',
      country: 'Test Country',
      postalcode: 'T1T1T1'
    };

    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('client_id');
      expect(response.body.data).toHaveProperty('token');
      
      clientId = response.body.data.client_id;
      authToken = response.body.data.token;
    });

    it('should login with registered credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          username: testUser.username,
          password: testUser.password
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      authToken = response.body.data.token;
    });

    it('should retrieve user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.username).toBe(testUser.username);
    });
  });

  describe('2. Flight Search and Selection Flow', () => {
    it('should search for available flights', async () => {
      const response = await request(app)
        .get('/api/v1/flights/search')
        .query({
          depart_airport_id: 1,
          arrive_airport_id: 2,
          depart_date: '2025-12-01'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      
      if (response.body.data.length > 0) {
        flightId = response.body.data[0].flight_id;
      }
    });

    it('should get flight details with seat availability', async () => {
      if (!flightId) {
        console.log('Skipping: No flights available for testing');
        return;
      }

      const response = await request(app)
        .get(`/api/v1/flights/${flightId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('flight_id');
      expect(response.body.data).toHaveProperty('airplane');
    });

    it('should get available seats for selected flight', async () => {
      if (!flightId) {
        console.log('Skipping: No flights available for testing');
        return;
      }

      const response = await request(app)
        .get(`/api/v1/flights/${flightId}/seats`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('3. Booking Creation Flow', () => {
    it('should create a booking with passenger details', async () => {
      if (!flightId) {
        console.log('Skipping: No flights available for testing');
        return;
      }

      const bookingData = {
        flight_id: flightId,
        passengers: [
          {
            firstname: 'John',
            lastname: 'Doe',
            dob: '1985-05-15',
            passport_no: 'AB123456',
            passport_expiry: '2030-12-31',
            nationality: 'US',
            seat_id: 1
          }
        ],
        support: 'N',
        fasttrack: 'N'
      };

      const response = await request(app)
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bookingData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('booking_id');
      bookingId = response.body.data.booking_id;
    });

    it('should retrieve booking details', async () => {
      if (!bookingId) {
        console.log('Skipping: No booking created');
        return;
      }

      const response = await request(app)
        .get(`/api/v1/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.booking_id).toBe(bookingId);
    });
  });

  describe('4. Payment Processing Flow', () => {
    it('should process payment for booking', async () => {
      if (!bookingId) {
        console.log('Skipping: No booking created');
        return;
      }

      const paymentData = {
        booking_id: bookingId,
        amount: 500.00,
        payment_method: 'credit_card',
        card_no: '4111111111111111',
        card_holder: 'John Doe',
        expiry_date: '12/25',
        cvv: '123'
      };

      const response = await request(app)
        .post('/api/v1/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(paymentData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('payment_id');
      paymentId = response.body.data.payment_id;
    });

    it('should verify booking status after payment', async () => {
      if (!bookingId) {
        console.log('Skipping: No booking created');
        return;
      }

      const response = await request(app)
        .get(`/api/v1/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('confirmed');
    });
  });

  describe('5. Booking Management Flow', () => {
    it('should retrieve all user bookings', async () => {
      const response = await request(app)
        .get('/api/v1/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should update booking details', async () => {
      if (!bookingId) {
        console.log('Skipping: No booking created');
        return;
      }

      const response = await request(app)
        .put(`/api/v1/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          support: 'Y',
          fasttrack: 'Y'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('6. Security and Error Handling', () => {
    it('should reject requests without authentication token', async () => {
      await request(app)
        .get('/api/v1/bookings')
        .expect(401);
    });

    it('should reject requests with invalid token', async () => {
      await request(app)
        .get('/api/v1/bookings')
        .set('Authorization', 'Bearer invalid_token')
        .expect(401);
    });

    it('should handle invalid booking ID gracefully', async () => {
      await request(app)
        .get('/api/v1/bookings/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should validate required fields in registration', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          username: 'incomplete'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});
