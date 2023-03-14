import { RequestHandler } from 'express';
import { AuthRequest } from '../../types/models.js';
import { User, UserModel } from '../users/users-schema.js';
import log from '../../logger.js';
import { encryptPassword } from './auth-utils.js';

export const registerController: RequestHandler<
  unknown,
  unknown,
  AuthRequest
> = async (req, res) => {
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
    log.error(err);
    return res.status(500).json({ msg: 'Error creating the new user' });
  }
};
