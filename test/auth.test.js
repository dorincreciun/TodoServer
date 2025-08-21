const request = require('supertest');
const { faker } = require('@faker-js/faker');
const app = require('../server');

describe('Auth Endpoints', () => {
  const baseUrl = '/api/v1/auth';

  describe('POST /register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        username: faker.internet.userName(),
        email: faker.internet.email(),
        password: 'TestPassword123!',
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
      };

      const response = await request(app).post(`${baseUrl}/register`).send(userData).expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Utilizator înregistrat cu succes');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.username).toBe(userData.username);
    });

    it('should return error for duplicate email', async () => {
      const userData = {
        username: faker.internet.userName(),
        email: 'test@example.com',
        password: 'TestPassword123!',
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
      };

      // Prima înregistrare
      await request(app).post(`${baseUrl}/register`).send(userData).expect(201);

      // A doua înregistrare cu același email
      const response = await request(app).post(`${baseUrl}/register`).send(userData).expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('există deja');
    });

    it('should return error for invalid email format', async () => {
      const userData = {
        username: faker.internet.userName(),
        email: 'invalid-email',
        password: 'TestPassword123!',
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
      };

      const response = await request(app).post(`${baseUrl}/register`).send(userData).expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('should return error for weak password', async () => {
      const userData = {
        username: faker.internet.userName(),
        email: faker.internet.email(),
        password: '123',
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
      };

      const response = await request(app).post(`${baseUrl}/register`).send(userData).expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /login', () => {
    let testUser;

    beforeEach(async () => {
      // Creează un utilizator de test
      testUser = {
        username: faker.internet.userName(),
        email: faker.internet.email(),
        password: 'TestPassword123!',
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
      };

      await request(app).post(`${baseUrl}/register`).send(testUser);
    });

    it('should login successfully with valid credentials', async () => {
      const loginData = {
        email: testUser.email,
        password: testUser.password,
      };

      const response = await request(app).post(`${baseUrl}/login`).send(loginData).expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Autentificare reușită');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
    });

    it('should return error for invalid credentials', async () => {
      const loginData = {
        email: testUser.email,
        password: 'WrongPassword123!',
      };

      const response = await request(app).post(`${baseUrl}/login`).send(loginData).expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Email sau parolă incorectă');
    });

    it('should return error for non-existent user', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'TestPassword123!',
      };

      const response = await request(app).post(`${baseUrl}/login`).send(loginData).expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Email sau parolă incorectă');
    });
  });

  describe('POST /refresh', () => {
    let refreshToken;

    beforeEach(async () => {
      // Creează un utilizator și obține refresh token
      const userData = {
        username: faker.internet.userName(),
        email: faker.internet.email(),
        password: 'TestPassword123!',
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
      };

      const registerResponse = await request(app).post(`${baseUrl}/register`).send(userData);

      refreshToken = registerResponse.body.data.refreshToken;
    });

    it('should refresh access token successfully', async () => {
      const response = await request(app).post(`${baseUrl}/refresh`).send({ refreshToken }).expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
    });

    it('should return error for invalid refresh token', async () => {
      const response = await request(app)
        .post(`${baseUrl}/refresh`)
        .send({ refreshToken: 'invalid-token' })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('INVALID_TOKEN');
    });
  });
});
