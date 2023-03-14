import { RequestHandler } from 'express';
import { AuthRequest, LoginResponse } from '../../types/models.js';
import { User, UserModel } from '../users/users-schema.js';
import log from '../../logger.js';
import { encryptPassword, generateJWTToken } from './auth-utils.js';

export const registerController: RequestHandler<
  unknown,
  unknown,
  AuthRequest
> = async (req, res, next) => {
  const { email, password } = req.body;

  const existingUser = await UserModel.findOne({ email }).exec();
  if (existingUser !== null) {
    log.debug('Email already registered');
    return res.status(409).json({ msg: 'The email is already registered' });
  }

  try {
    const newUser: User = {
      email,
      password: encryptPassword(password),
      name: email.split('@')[0],
      surname: '',
      username: '',
      avatar: '',
      biography: '',
      posts: [],
      followers: [],
      following: [],
      favGames: [],
    };

    await UserModel.create(newUser);
    log.debug('New user created');
    return res.status(201).json({ msg: 'New user successfully created!' });
  } catch (err) {
    next(err);
  }
};

export const loginController: RequestHandler<
  unknown,
  LoginResponse | { msg: string },
  AuthRequest
> = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user: AuthRequest = {
      email,
      password: encryptPassword(password),
    };

    const existingUser = await UserModel.findOne(user).exec();

    if (existingUser === null) {
      log.debug('User not found');
      return res.status(404).json({ msg: 'User not found' });
    }

    const userToken = generateJWTToken(email);
    log.debug('Token generated');
    return res.status(201).json({ accessToken: userToken });
  } catch (err) {
    next(err);
  }
};
