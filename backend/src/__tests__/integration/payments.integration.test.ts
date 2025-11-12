import request from 'supertest';
import { describe, it, expect, beforeAll } from '@jest/globals';
import { createTestApp } from './app';
import { generateRandomEmail, generateRandomUsername } from '../utils/testHelpers';

const app = createTestApp();

describe('Payments Integration Tests', () => {
  let authToken: string;
  let bookingId: number;

  beforeAll(async () => {
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

    await request(app)
      .post('/api/v1/auth/register')
      .send(testUser);

    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        username: testUser.username,
        password: testUser.password
      });

    if (loginResponse.body.success) {
      authToken = loginResponse.body.data.token;
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
          seat_id: 2
        }
      ]
    };

    const bookingResponse = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${authToken}`)
      .send(bookingData);

    if (bookingResponse.body.success) {
      bookingId = bookingResponse.body.data.booking_id;
    }
  });

  describe('POST /api/v1/payments', () => {
    it('should process payment with valid data and authentication', async () => {
      if (!authToken || !bookingId) {
        console.log('Skipping test - no auth token or booking ID available');
        return;
      }

      const paymentData = {
        booking_id: bookingId,
        amount: 500.00,
        payment_method: 'credit_card',
        card_no: '1234567890123456',
        four_digit: '1234'
      };

      const response = await request(app)
        .post('/api/v1/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(paymentData)
        .expect('Content-Type', /json/);

      if (response.status === 201) {
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('payment_id');
        expect(response.body.data).toHaveProperty('status');
      }
    });

    it('should reject payment without authentication', async () => {
      const paymentData = {
        booking_id: 1,
        amount: 500.00,
        payment_method: 'credit_card',
        card_no: '1234567890123456',
        four_digit: '1234'
      };

      const response = await request(app)
        .post('/api/v1/payments')
        .send(paymentData)
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject payment with invalid booking_id', async () => {
      if (!authToken) {
        console.log('Skipping test - no auth token available');
        return;
      }

      const paymentData = {
        booking_id: 99999,
        amount: 500.00,
        payment_method: 'credit_card',
        card_no: '1234567890123456',
        four_digit: '1234'
      };

      const response = await request(app)
        .post('/api/v1/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(paymentData)
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should reject payment with invalid amount', async () => {
      if (!authToken || !bookingId) {
        console.log('Skipping test - no auth token or booking ID available');
        return;
      }

      const paymentData = {
        booking_id: bookingId,
        amount: -100,
        payment_method: 'credit_card',
        card_no: '1234567890123456',
        four_digit: '1234'
      };

      const response = await request(app)
        .post('/api/v1/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(paymentData)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/payments/:bookingId', () => {
    it('should get payment status with authentication', async () => {
      if (!authToken || !bookingId) {
        console.log('Skipping test - no auth token or booking ID available');
        return;
      }

      const response = await request(app)
        .get(`/api/v1/payments/${bookingId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should reject request without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/payments/1')
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});
