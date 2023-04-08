import request from 'supertest';
import { generateJWTToken } from './api/auth/auth-utils';
import app from './app';
import dotenv from 'dotenv';
dotenv.config();

const token = generateJWTToken('userId');

describe('Given an app', () => {
  test('When the server starts, then the route app path should have a Server ON message', async () => {
    const res = await request(app).get('/');
    expect(res.body).toEqual(/Server ON/i);
  });

  test('When the user wants to validate his token with a valid token, then the response should be a 200', async () => {
    const res = await request(app)
      .get('/token-validation')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  test('When the user wants to validate his token with an invalid token, then the response should be a 401', async () => {
    const res = await request(app).get('/token-validation');
    expect(res.status).toBe(401);
  });
});
