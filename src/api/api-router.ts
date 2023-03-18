import express from 'express';
import { postsRouter } from './posts/posts-router.js';

const apiRouter = express.Router();

apiRouter.use('/posts', postsRouter);

export default apiRouter;
