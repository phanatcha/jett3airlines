import request from 'supertest';
import { describe, it, expect, beforeAll } from '@jest/globals';
import { createTestApp } from './app';
import { generateRandomEmail, generateRandomUsername } from '../utils/testHelpers';

const app = createTestApp();

describe('Authentication Integration Tests', () => {
  let testUser = {
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

  let authToken: string;

  describe('POST /api/v1/auth/register', () => {
    it('should register a new client with valid data', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('client_id');
      expect(response.body.data).toHaveProperty('username', testUser.username);
    });

    it('should reject registration with duplicate username', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser)
        .expect('Content-Type', /json/)
        .expect(409);

      expect(response.body.success).toBe(false);
    });

    it('should reject registration with invalid email', async () => {
      const invalidUser = { ...testUser, username: generateRandomUsername(), email: 'invalid-email' };
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(invalidUser)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject registration with missing required fields', async () => {
      const incompleteUser = { username: 'testuser', password: 'pass' };
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(incompleteUser)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          username: testUser.username,
          password: testUser.password
        })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('client');
      
      authToken = response.body.data.token;
    });

    it('should reject login with invalid password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          username: testUser.username,
          password: 'wrongpassword'
        })
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject login with non-existent username', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          username: 'nonexistentuser',
          password: 'password123'
        })
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/auth/profile', () => {
    it('should get profile with valid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('username', testUser.username);
      expect(response.body.data).not.toHaveProperty('password');
    });

    it('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/auth/profile', () => {
    it('should update profile with valid token', async () => {
      const updates = {
        phone_no: '9876543210',
        city: 'Updated City'
      };

      const response = await request(app)
        .put('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updates)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('phone_no', updates.phone_no);
      expect(response.body.data).toHaveProperty('city', updates.city);
    });

    it('should reject profile update without token', async () => {
      const response = await request(app)
        .put('/api/v1/auth/profile')
        .send({ city: 'New City' })
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});
