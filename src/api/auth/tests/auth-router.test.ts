import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../../app';
import { connectDB } from '../../../database/mongodb';
import { AuthRequest } from '../../../types/models';
import dotenv from 'dotenv';
dotenv.config();

describe('Given an app with auth-router', () => {
  let mongoServer: MongoMemoryServer;
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
  });
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUrl = mongoServer.getUri();
    await connectDB(mongoUrl);
  });
  afterAll(async () => {
    await mongoServer.stop();
    await mongoose.connection.close();
    process.env = OLD_ENV;
  });

  describe('When a user wants to register', () => {
    test('With a valid email and password, then it should be registered', async () => {
      const user: AuthRequest = {
        email: 'user@email.com',
        password: 'password',
      };

      await request(app).post('/auth/register').send(user).expect(201);
    });

    test('With an invalid email, then it should not be able to register', async () => {
      const invalidUser: AuthRequest = {
        email: 'invalidEmail',
        password: 'password',
      };

      const response = await request(app)
        .post('/auth/register')
        .send(invalidUser)
        .expect(res => {
          expect(res.status).toBe(400);
          expect(res.body).toHaveProperty('msg');
        });

      await expect(response.body.msg).toEqual('"email" must be a valid email');
    });

    test('But the email is already in use, then it should not be able to register', async () => {
      const repeatedEmailUser: AuthRequest = {
        email: 'user@email.com',
        password: 'password',
      };

      await request(app)
        .post('/auth/register')
        .send(repeatedEmailUser)
        .expect(409);
    });
  });

  describe('When a user wants to login', () => {
    test('With a valid email and password, then his token should be generated', async () => {
      const user: AuthRequest = {
        email: 'user@email.com',
        password: 'password',
      };

      await request(app).post('/auth/login').send(user).expect(201);
    });

    test('With an invalid email, then it should receive an error', async () => {
      const notRegisteredUser: AuthRequest = {
        email: 'notRegisteredUser@email.com',
        password: 'password',
      };

      await request(app)
        .post('/auth/login')
        .send(notRegisteredUser)
        .expect(404);
    });
  });

  describe('But the environment variables are missing or undefined', () => {
    test('then it should throw an error on encryption algorithm', async () => {
      delete process.env.PASSWORD_ENCRYPTION_ALGORITHM;
      const user: AuthRequest = {
        email: 'user5@email.com',
        password: 'password',
      };

      await request(app).post('/auth/register').send(user).expect(500);
    });

    test('then it should throw an error on encryption key', async () => {
      delete process.env.PASSWORD_ENCRYPTION_KEY;
      const user: AuthRequest = {
        email: 'user5@email.com',
        password: 'password',
      };

      await request(app).post('/auth/register').send(user).expect(500);
    });

    test('then it should throw an error on jwt secret', async () => {
      delete process.env.JWT_SECRET;
      const user: AuthRequest = {
        email: 'user5@email.com',
        password: 'password',
      };

      await request(app).post('/auth/register').send(user).expect(201);
      await request(app).post('/auth/login').send(user).expect(500);
    });
  });
});
