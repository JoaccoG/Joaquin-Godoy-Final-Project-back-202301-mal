import express from 'express';
import { validate } from 'express-validation';
import upload from '../../database/multer.js';
import {
  createNewPostController,
  deletePostController,
  getAllPostsController,
} from './posts-controllers.js';
import { postValidation } from './posts-validation.js';

export const postsRouter = express.Router();

postsRouter
  .route('/')
  .get(getAllPostsController)
  .post(
    upload.single('photo'),
    validate(postValidation, {}, {}),
    createNewPostController,
  );

postsRouter.route('/:idPost').delete(deletePostController);
