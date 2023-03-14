import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../../app';
import { connectDB } from '../../../database/mongodb';
import { AuthRequest } from '../../../types/models';

describe('Given an app with auth-router', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUrl = mongoServer.getUri();
    await connectDB(mongoUrl);
  });

  afterAll(async () => {
    await mongoServer.stop();
    await mongoose.connection.close();
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

      await request(app).post('/auth/register').send(invalidUser).expect(500);
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
});
