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
    posts.sort((a, b) => b.date - a.date);
    return res.status(200).json(posts);
  } catch (err) {
    next(err);
  }
};

export const createNewPostController: RequestHandler<
  unknown,
  { msg: string; post: Post },
  Pick<Post, 'game' | 'review' | 'rating'>,
  unknown,
  UserLocalsId
> = async (req, res, next) => {
  const { game, review, rating } = req.body;
  const user = res.locals.id;
  const fileBuffer = req.file?.buffer;
  const fileName = `PostPhoto-${user}-${Date.now()}.webp`;

  try {
    const gameId = await GameModel.findOne({ name: game }).exec();
    if (gameId === null) {
      throw new CustomHTTPError(404, 'Game to rate not found');
    }

    let newPost = {
      user,
      game: gameId._id,
      review,
      rating,
      photo: '',
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

    const post = await (await PostModel.create(newPost)).populate('user game');
    const userRes = await UserModel.updateOne(
      { _id: user },
      { $push: { posts: post._id } },
    ).exec();
    if (userRes.matchedCount === 0) {
      throw new CustomHTTPError(404, 'User to update not found');
    }

    const gameRes = await GameModel.updateOne(
      { _id: gameId._id },
      { $push: { posts: post._id } },
    ).exec();
    if (gameRes.matchedCount === 0) {
      throw new CustomHTTPError(404, 'Game to update not found');
    }

    log.info('New post successfully created');
    return res.status(201).json({ msg: 'New post created!', post });
  } catch (err) {
    next(err);
  }
};
