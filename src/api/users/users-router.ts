import express from 'express';
import {
  getUserByIdController,
  getUserPostsByIdController,
} from './users-controllers.js';

export const usersRouter = express.Router();

usersRouter.route('/:idUser').get(getUserByIdController);
usersRouter.route('/:idUser/posts').get(getUserPostsByIdController);
