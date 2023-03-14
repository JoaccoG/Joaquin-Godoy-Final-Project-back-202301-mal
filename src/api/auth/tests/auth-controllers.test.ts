import { NextFunction, Request, Response } from 'express';
import { User, UserModel } from '../../users/users-schema';
import { loginController, registerController } from '../auth-controllers';
import { encryptPassword } from '../auth-utils';
import dotenv from 'dotenv';
dotenv.config();

const newUser: User = {
  email: 'mock@email.com',
  password: encryptPassword('mockedPassword'),
  name: 'mock',
  surname: '',
  username: '',
  avatar: '',
  biography: '',
  posts: [],
  followers: [],
  following: [],
  favGames: [],
};

const request = {
  body: {
    email: 'mock@email.com',
    password: 'mockedPassword',
  },
} as Partial<Request>;
const response = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
} as Partial<Response>;
const next = jest.fn();

const OLD_ENV = process.env;
beforeEach(() => {
  jest.resetModules();
  process.env = { ...OLD_ENV };
});
afterAll(() => {
  process.env = OLD_ENV;
});

UserModel.findOne = jest.fn().mockReturnValue({
  exec: jest.fn().mockResolvedValue(null),
});

describe('Given a register controller', () => {
  test('When the password encryption algorithm environment variable does not exist, then the response should be an error', async () => {
    delete process.env.PASSWORD_ENCRYPTION_ALGORITHM;
    await registerController(request as Request, response as Response, next);
    expect(next).toHaveBeenCalled();
  });

  test('When the password encryption key environment variable does not exist, then the response should be an error', async () => {
    delete process.env.PASSWORD_ENCRYPTION_KEY;
    await registerController(
      request as Request,
      response as Response,
      next as NextFunction,
    );
    expect(next).toHaveBeenCalled();
  });

  test('When the user tries to register, then the new user should be created on the database', async () => {
    UserModel.create = jest.fn();
    await registerController(
      request as Request,
      response as Response,
      jest.fn(),
    );
    expect(response.status).toHaveBeenCalledWith(201);
    expect(UserModel.create).toHaveBeenCalledWith(newUser);
  });

  test('When the recevied email is already used, then the response should be an error', async () => {
    UserModel.findOne = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(1),
    });
    await registerController(
      request as Request,
      response as Response,
      jest.fn(),
    );
    expect(response.status).toHaveBeenCalledWith(409);
  });
});

describe('Given a login controller', () => {
  test('When the json web token secret environment variable does not exist, then the response should be an error', async () => {
    delete process.env.JWT_SECRET;
    await loginController(
      request as Request,
      response as Response,
      next as NextFunction,
    );
    expect(next).toHaveBeenCalled();
  });

  test('When the user tries to login with a valid account, then his token should be generated', async () => {
    await loginController(request as Request, response as Response, jest.fn());
    expect(response.status).toHaveBeenCalledWith(201);
  });
});
