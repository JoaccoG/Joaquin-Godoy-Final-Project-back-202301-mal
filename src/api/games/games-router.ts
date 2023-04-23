import express from 'express';
import {
  getGameByIdController,
  getGamesController,
} from './games-controllers.js';

export const gamesRouter = express.Router();

gamesRouter.route('/').get(getGamesController);
gamesRouter.route('/:idGame').get(getGameByIdController);
