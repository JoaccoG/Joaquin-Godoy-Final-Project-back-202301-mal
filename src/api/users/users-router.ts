import express from 'express';
import { getUserByIdController } from './users-controllers.js';

export const usersRouter = express.Router();

usersRouter.route('/:idUser').get(getUserByIdController);
