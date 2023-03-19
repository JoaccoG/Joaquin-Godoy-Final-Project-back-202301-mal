import express from 'express';
import upload from '../../database/multer.js';
import {
  createNewPostController,
  getAllPostsController,
} from './posts-controllers.js';

export const postsRouter = express.Router();

postsRouter
  .route('/')
  .get(getAllPostsController)
  .post(upload.single('photo'), createNewPostController);
