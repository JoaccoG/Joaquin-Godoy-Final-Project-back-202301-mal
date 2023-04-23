import express from 'express';
import { postsRouter } from './posts/posts-router.js';
import { usersRouter } from './users/users-router.js';
import { gamesRouter } from './games/games-router.js';

const apiRouter = express.Router();

apiRouter.use('/posts', postsRouter);
apiRouter.use('/users', usersRouter);
apiRouter.use('/games', gamesRouter);

export default apiRouter;
