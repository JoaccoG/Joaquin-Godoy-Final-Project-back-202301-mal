import { RequestHandler } from 'express';
import { POSTS_BUCKET_NAME, supabase } from '../../database/supabase.js';
import { CustomHTTPError } from '../../errors/custom-http-error.js';
import log from '../../logger.js';
import { UserLocalsId } from '../../types/models.js';
import { GameModel } from '../games/games-schema.js';
import { UserModel } from '../users/users-schema.js';
import { Post, PostModel } from './posts-schema.js';

export const getAllPostsController: RequestHandler = async (
  _req,
  res,
  next,
) => {
  try {
    const posts = await PostModel.find({}).populate('user game').exec();
    return res.status(200).json(posts);
  } catch (err) {
    next(err);
  }
};

export const createNewPostController: RequestHandler<
  unknown,
  Post,
  Pick<Post, 'game' | 'review' | 'rating'>,
  unknown,
  UserLocalsId
> = async (req, res, next) => {
  const user = res.locals.id;
  const { game, review, rating } = req.body;
  const fileBuffer = req.file!.buffer;
  const fileName = `PostPhoto-${user}-${Date.now()}.webp`;

  try {
    const gameId = await GameModel.findOne({ name: game }).exec();
    if (gameId === null) {
      throw new CustomHTTPError(404, 'Game not found');
    }

    let newPost = {
      user,
      game: gameId._id,
      review,
      rating,
      photo: '',
      likes: 0,
      date: Date.now(),
    };

    if (fileBuffer !== undefined) {
      const { error } = await supabase.storage
        .from(POSTS_BUCKET_NAME)
        .upload(fileName, fileBuffer, {
          upsert: true,
        });

      if (error === null) {
        const { data } = supabase.storage
          .from(POSTS_BUCKET_NAME)
          .getPublicUrl(fileName);

        newPost = {
          ...newPost,
          photo: data.publicUrl,
        };
      }
    }

    const post = await PostModel.create(newPost);
    const userRes = await UserModel.updateOne(
      { _id: user },
      { $push: { posts: post._id } },
    ).exec();
    if (userRes.matchedCount === 0) {
      throw new CustomHTTPError(404, 'User not found');
    }

    const gameRes = await GameModel.updateOne(
      { _id: gameId._id },
      { $push: { posts: post._id } },
    ).exec();
    if (gameRes.matchedCount === 0) {
      throw new CustomHTTPError(404, 'Game not found');
    }

    log.info('New post successfully created');
    return res.status(201).json(post);
  } catch (err) {
    next(err);
  }
};
