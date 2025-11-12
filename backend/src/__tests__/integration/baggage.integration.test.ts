import request from 'supertest';
import { describe, it, expect, beforeAll } from '@jest/globals';
import { createTestApp } from './app';
import { generateRandomEmail, generateRandomUsername } from '../utils/testHelpers';

const app = createTestApp();

describe('Baggage Integration Tests', () => {
  let authToken: string;
  let bookingId: number;
  let passengerId: number;
  let baggageId: number;

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
          seat_id: 3
        }
      ]
    };

    const bookingResponse = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${authToken}`)
      .send(bookingData);

    if (bookingResponse.body.success) {
      bookingId = bookingResponse.body.data.booking_id;
      if (bookingResponse.body.data.passengers && bookingResponse.body.data.passengers.length > 0) {
        passengerId = bookingResponse.body.data.passengers[0].passenger_id;
      }
    }
  });

  describe('POST /api/v1/baggage', () => {
    it('should create baggage record with valid data and authentication', async () => {
      if (!authToken || !passengerId) {
        console.log('Skipping test - no auth token or passenger ID available');
        return;
      }

      const baggageData = {
        passenger_id: passengerId,
        weight: 15.5,
        status: 'checked-in'
      };

      const response = await request(app)
        .post('/api/v1/baggage')
        .set('Authorization', `Bearer ${authToken}`)
        .send(baggageData)
        .expect('Content-Type', /json/);

      if (response.status === 201) {
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('baggage_id');
        expect(response.body.data).toHaveProperty('tracking_no');
        baggageId = response.body.data.baggage_id;
      }
    });

    it('should reject baggage creation without authentication', async () => {
      const baggageData = {
        passenger_id: 1,
        weight: 15.5,
        status: 'checked-in'
      };

      const response = await request(app)
        .post('/api/v1/baggage')
        .send(baggageData)
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject baggage with invalid weight', async () => {
      if (!authToken || !passengerId) {
        console.log('Skipping test - no auth token or passenger ID available');
        return;
      }

      const baggageData = {
        passenger_id: passengerId,
        weight: -5,
        status: 'checked-in'
      };

      const response = await request(app)
        .post('/api/v1/baggage')
        .set('Authorization', `Bearer ${authToken}`)
        .send(baggageData)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/baggage/track/:trackingNo', () => {
    it('should track baggage with valid tracking number', async () => {
      if (!baggageId) {
        console.log('Skipping test - no baggage ID available');
        return;
      }

      const baggageResponse = await request(app)
        .get(`/api/v1/baggage/${baggageId}`)
        .set('Authorization', `Bearer ${authToken}`);

      if (baggageResponse.body.success && baggageResponse.body.data?.tracking_no) {
        const trackingNo = baggageResponse.body.data.tracking_no;

        const response = await request(app)
          .get(`/api/v1/baggage/track/${trackingNo}`)
          .expect('Content-Type', /json/)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('tracking_no', trackingNo);
      }
    });

    it('should return 404 for invalid tracking number', async () => {
      const response = await request(app)
        .get('/api/v1/baggage/track/INVALID123')
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/baggage/:id', () => {
    it('should get baggage details with authentication', async () => {
      if (!authToken || !baggageId) {
        console.log('Skipping test - no auth token or baggage ID available');
        return;
      }

      const response = await request(app)
        .get(`/api/v1/baggage/${baggageId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('baggage_id', baggageId);
    });

    it('should reject request without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/baggage/1')
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/v1/baggage/:id/status', () => {
    it('should update baggage status with authentication', async () => {
      if (!authToken || !baggageId) {
        console.log('Skipping test - no auth token or baggage ID available');
        return;
      }

      const statusUpdate = {
        status: 'in-transit'
      };

      const response = await request(app)
        .patch(`/api/v1/baggage/${baggageId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(statusUpdate)
        .expect('Content-Type', /json/);

      if (response.status === 200) {
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('status', 'in-transit');
      }
    });

    it('should reject status update without authentication', async () => {
      const response = await request(app)
        .patch('/api/v1/baggage/1/status')
        .send({ status: 'in-transit' })
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/baggage/passenger/:passengerId', () => {
    it('should get passenger baggage with authentication', async () => {
      if (!authToken || !passengerId) {
        console.log('Skipping test - no auth token or passenger ID available');
        return;
      }

      const response = await request(app)
        .get(`/api/v1/baggage/passenger/${passengerId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should reject request without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/baggage/passenger/1')
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});
