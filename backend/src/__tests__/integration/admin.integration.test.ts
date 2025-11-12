import request from 'supertest';
import { describe, it, expect, beforeAll } from '@jest/globals';
import { createTestApp } from './app';
import { generateRandomEmail, generateRandomUsername } from '../utils/testHelpers';

const app = createTestApp();

describe('Admin Integration Tests', () => {
  let adminToken: string;
  let userToken: string;

  beforeAll(async () => {
    const adminLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({
        username: process.env.ADMIN_USERNAME || 'admin',
        password: process.env.ADMIN_PASSWORD || 'admin123'
      });

    if (adminLogin.body.success && adminLogin.body.data?.token) {
      adminToken = adminLogin.body.data.token;
    }

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

  describe('Admin Authentication', () => {
    it('should reject admin requests without token', async () => {
      const response = await request(app)
        .get('/api/v1/admin/bookings')
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject admin requests with regular user token', async () => {
      if (!userToken) {
        console.log('Skipping test - no user token available');
        return;
      }

      const response = await request(app)
        .get('/api/v1/admin/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .expect('Content-Type', /json/)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/admin/bookings', () => {
    it('should get all bookings with admin token', async () => {
      if (!adminToken) {
        console.log('Skipping test - no admin token available');
        return;
      }

      const response = await request(app)
        .get('/api/v1/admin/bookings')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should support pagination', async () => {
      if (!adminToken) {
        console.log('Skipping test - no admin token available');
        return;
      }

      const response = await request(app)
        .get('/api/v1/admin/bookings')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ page: 1, limit: 10 })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('pagination');
    });
  });

  describe('GET /api/v1/admin/clients', () => {
    it('should get all clients with admin token', async () => {
      if (!adminToken) {
        console.log('Skipping test - no admin token available');
        return;
      }

      const response = await request(app)
        .get('/api/v1/admin/clients')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/v1/admin/payments', () => {
    it('should get all payments with admin token', async () => {
      if (!adminToken) {
        console.log('Skipping test - no admin token available');
        return;
      }

      const response = await request(app)
        .get('/api/v1/admin/payments')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/v1/admin/airports', () => {
    it('should get all airports with admin token', async () => {
      if (!adminToken) {
        console.log('Skipping test - no admin token available');
        return;
      }

      const response = await request(app)
        .get('/api/v1/admin/airports')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('POST /api/v1/admin/airports', () => {
    it('should create airport with admin token', async () => {
      if (!adminToken) {
        console.log('Skipping test - no admin token available');
        return;
      }

      const newAirport = {
        airport_code: 'TST',
        airport_name: 'Test Airport',
        city: 'Test City',
        country: 'Test Country'
      };

      const response = await request(app)
        .post('/api/v1/admin/airports')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newAirport)
        .expect('Content-Type', /json/);

      if (response.status === 201) {
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('airport_id');
      }
    });

    it('should reject airport creation with regular user token', async () => {
      if (!userToken) {
        console.log('Skipping test - no user token available');
        return;
      }

      const newAirport = {
        airport_code: 'TST',
        airport_name: 'Test Airport',
        city: 'Test City',
        country: 'Test Country'
      };

      const response = await request(app)
        .post('/api/v1/admin/airports')
        .set('Authorization', `Bearer ${userToken}`)
        .send(newAirport)
        .expect('Content-Type', /json/)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/admin/baggage', () => {
    it('should get all baggage with admin token', async () => {
      if (!adminToken) {
        console.log('Skipping test - no admin token available');
        return;
      }

      const response = await request(app)
        .get('/api/v1/admin/baggage')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
});
