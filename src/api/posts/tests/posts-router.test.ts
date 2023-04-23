import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { connectDB } from '../../../database/mongodb';
import app from '../../../app';
import { generateJWTToken } from '../../auth/auth-utils';

describe('Given a route that needs authentication', () => {
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

  const token = generateJWTToken('userId');

  describe('When the user is authenticated', () => {
    test('Then it should be allowed to use the path', async () => {
      await request(app)
        .get('/api/v1/posts?limit=4&offset=0')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });
  });

  describe('When the user is not authenticated', () => {
    test('Then the response should be an unauthorized error msg', async () => {
      await request(app).get('/api/v1/posts').expect(401);
    });
  });

  describe('When an environment variable definition is missing', () => {
    test('Then the response should be an error', async () => {
      delete process.env.JWT_SECRET;
      await request(app)
        .get('/api/v1/posts')
        .set('Authorization', `Bearer ${token}`)
        .expect(500);
    });
  });
});
