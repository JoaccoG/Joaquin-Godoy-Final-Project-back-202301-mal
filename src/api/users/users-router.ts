import express from 'express';
import {
  addFollowerController,
  getUserByIdController,
  getUserPostsByIdController,
  removeFollowerController,
} from './users-controllers.js';

export const usersRouter = express.Router();

usersRouter.route('/:idUser').get(getUserByIdController);
usersRouter.route('/:idUser/posts').get(getUserPostsByIdController);
usersRouter
  .route('/:idUser/followers')
  .post(addFollowerController)
  .delete(removeFollowerController);
