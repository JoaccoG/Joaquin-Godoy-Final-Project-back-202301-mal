import { RequestHandler } from 'express';
import { AuthRequest, LoginResponse } from '../../types/models.js';
import { User, UserModel } from '../users/users-schema.js';
import log from '../../logger.js';
import { encryptPassword, generateJWTToken } from './auth-utils.js';
import { CustomHTTPError } from '../../errors/custom-http-error.js';

export const registerController: RequestHandler<
  unknown,
  unknown,
  AuthRequest
> = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const existingUser = await UserModel.findOne({ email }).exec();
    if (existingUser !== null) {
      throw new CustomHTTPError(409, 'That email is already registered');
    }

    const newUser: User = {
      email,
      password: encryptPassword(password),
      username: email.split('@')[0],
      name: '',
      surname: '',
      avatar: '',
      biography: '',
      posts: [],
      followers: [],
      following: [],
      favGames: [],
    };

    await UserModel.create(newUser);
    log.info('New user created.');
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
      throw new CustomHTTPError(404, 'User not found');
    }

    const userToken = generateJWTToken(existingUser._id.toString());
    log.info('JWT User Token generated.');
    return res.status(201).json({
      accessToken: userToken,
      user: existingUser._id.toString(),
    });
  } catch (err) {
    next(err);
  }
};
