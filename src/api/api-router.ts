import express from 'express';
import { postsRouter } from './posts/posts-router.js';
import { usersRouter } from './users/users-router.js';

const apiRouter = express.Router();

apiRouter.use('/posts', postsRouter);
apiRouter.use('/users', usersRouter);

export default apiRouter;
