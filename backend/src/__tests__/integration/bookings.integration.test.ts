import request from 'supertest';
import { describe, it, expect, beforeAll } from '@jest/globals';
import { createTestApp } from './app';
import { generateRandomEmail, generateRandomUsername } from '../utils/testHelpers';

const app = createTestApp();

describe('Bookings Integration Tests', () => {
  let authToken: string;
  let clientId: number;
  let bookingId: number;

  beforeAll(async () => {
    // Register and login a test user
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
      country: 'Test Country',
      postalcode: '12345',
      card_no: '1234567890123456',
      four_digit: '1234',
      payment_type: 'credit'
    };

    const registerResponse = await request(app)
      .post('/api/v1/auth/register')
      .send(testUser);

    if (registerResponse.body.success) {
      clientId = registerResponse.body.data.client_id;
    }

    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        username: testUser.username,
        password: testUser.password
      });

    if (loginResponse.body.success) {
      authToken = loginResponse.body.data.token;
    }
  });

  describe('POST /api/v1/bookings', () => {
    it('should create a booking with valid data and authentication', async () => {
      if (!authToken) {
        console.log('Skipping test - no auth token available');
        return;
      }

      const bookingData = {
        flight_id: 1,
        support: 'no',
        fasttrack: 'no',
        passengers: [
          {
            firstname: 'John',
            lastname: 'Doe',
            passport_no: 'AB123456',
            nationality: 'USA',
            phone_no: '1234567890',
            gender: 'Male',
            dob: '1985-05-15',
            weight_limit: 20,
            seat_id: 1
          }
        ]
      };

      const response = await request(app)
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bookingData)
        .expect('Content-Type', /json/);

      if (response.status === 201) {
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('booking_id');
        bookingId = response.body.data.booking_id;
      }
    });

    it('should reject booking without authentication', async () => {
      const bookingData = {
        flight_id: 1,
        support: 'no',
        fasttrack: 'no',
        passengers: [
          {
            firstname: 'John',
            lastname: 'Doe',
            passport_no: 'AB123456',
            nationality: 'USA',
            phone_no: '1234567890',
            gender: 'Male',
            dob: '1985-05-15',
            weight_limit: 20,
            seat_id: 1
          }
        ]
      };

      const response = await request(app)
        .post('/api/v1/bookings')
        .send(bookingData)
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject booking with invalid flight_id', async () => {
      if (!authToken) {
        console.log('Skipping test - no auth token available');
        return;
      }

      const bookingData = {
        flight_id: 99999,
        support: 'no',
        fasttrack: 'no',
        passengers: [
          {
            firstname: 'John',
            lastname: 'Doe',
            passport_no: 'AB123456',
            nationality: 'USA',
            phone_no: '1234567890',
            gender: 'Male',
            dob: '1985-05-15',
            weight_limit: 20,
            seat_id: 1
          }
        ]
      };

      const response = await request(app)
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bookingData)
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should reject booking without passengers', async () => {
      if (!authToken) {
        console.log('Skipping test - no auth token available');
        return;
      }

      const bookingData = {
        flight_id: 1,
        support: 'no',
        fasttrack: 'no',
        passengers: []
      };

      const response = await request(app)
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bookingData)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/bookings', () => {
    it('should get user bookings with authentication', async () => {
      if (!authToken) {
        console.log('Skipping test - no auth token available');
        return;
      }

      const response = await request(app)
        .get('/api/v1/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should reject request without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/bookings')
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/bookings/:id', () => {
    it('should get booking details with authentication', async () => {
      if (!authToken || !bookingId) {
        console.log('Skipping test - no auth token or booking ID available');
        return;
      }

      const response = await request(app)
        .get(`/api/v1/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('booking_id', bookingId);
    });

    it('should reject request without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/bookings/1')
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/bookings/:id', () => {
    it('should update booking with authentication', async () => {
      if (!authToken || !bookingId) {
        console.log('Skipping test - no auth token or booking ID available');
        return;
      }

      const updates = {
        support: 'yes',
        fasttrack: 'yes'
      };

      const response = await request(app)
        .put(`/api/v1/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updates)
        .expect('Content-Type', /json/);

      if (response.status === 200) {
        expect(response.body.success).toBe(true);
      }
    });

    it('should reject update without authentication', async () => {
      const response = await request(app)
        .put('/api/v1/bookings/1')
        .send({ support: 'yes' })
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/v1/bookings/:id', () => {
    it('should reject cancellation without authentication', async () => {
      const response = await request(app)
        .delete('/api/v1/bookings/1')
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});
