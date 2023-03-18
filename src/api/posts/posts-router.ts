import express from 'express';
import {
  createNewPostController,
  getAllPostsController,
} from './posts-controllers.js';
import uploadGameImg from './posts-img-middleware.js';

export const postsRouter = express.Router();

postsRouter
  .route('/')
  .get(getAllPostsController)
  .post(uploadGameImg.single('photo'), createNewPostController);
