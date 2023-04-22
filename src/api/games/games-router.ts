import express from 'express';
import { getGamesController } from './games-controllers.js';

export const gamesRouter = express.Router();

gamesRouter.route('/').get(getGamesController);
