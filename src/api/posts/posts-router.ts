import express from 'express';
import { createNewPostController } from './posts-controllers.js';
import uploadGameImg from './posts-img-middleware.js';

export const postsRouter = express.Router();

postsRouter
  .route('/:gameId')
  .post(uploadGameImg.single('photo'), createNewPostController);
