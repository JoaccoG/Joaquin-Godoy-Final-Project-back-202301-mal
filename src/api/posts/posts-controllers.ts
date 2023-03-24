import { RequestHandler } from 'express';
import { POSTS_BUCKET_NAME, supabase } from '../../database/supabase.js';
import { CustomHTTPError } from '../../errors/custom-http-error.js';
import log from '../../logger.js';
import { UserLocalsId } from '../../types/models.js';
import { GameModel } from '../games/games-schema.js';
import { UserModel } from '../users/users-schema.js';
import { Post, PostModel } from './posts-schema.js';

export const getAllPostsController: RequestHandler<
  unknown,
  unknown,
  unknown,
  {
    offset: number;
    limit: number;
  }
> = async (req, res, next) => {
  const { offset, limit } = req.query;

  try {
    const postsCount = await PostModel.countDocuments().exec();

    const posts = await PostModel.find({})
      .sort({ date: -1 })
      .limit(limit)
      .skip(offset)
      .populate({ path: 'user', select: 'username name surname avatar' })
      .populate({ path: 'game', select: 'name banner' })
      .exec();

    return res
      .status(200)
      .json({ msg: 'Successfully fetched posts!', count: postsCount, posts });
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
    return res.status(201).json({ msg: 'New post successfully created', post });
  } catch (err) {
    next(err);
  }
};

export const deletePostController: RequestHandler<
  { idPost: string },
  unknown,
  unknown,
  unknown,
  UserLocalsId
> = async (req, res, next) => {
  const post = req.params.idPost;
  const user = res.locals.id;

  try {
    const postToDelete = await PostModel.findOne({ _id: post }).exec();
    if (postToDelete === null) {
      throw new CustomHTTPError(404, 'Post to delete not found');
    }

    if (postToDelete.user.toString() !== user) {
      throw new CustomHTTPError(403, 'Not authorized to delete post');
    }

    const { game, photo } = postToDelete;

    if (photo) {
      const file = photo.substring(photo.lastIndexOf('/') + 1);
      await supabase.storage.from(POSTS_BUCKET_NAME).remove([file]);

      log.info('Post photo successfully deleted');
    }

    const userRes = await UserModel.updateOne(
      { _id: user },
      { $pull: { posts: post } },
    ).exec();
    if (userRes.matchedCount === 0) {
      throw new CustomHTTPError(404, 'User of the post not found');
    }

    const gameRes = await GameModel.updateOne(
      { _id: game },
      { $pull: { posts: post } },
    ).exec();
    if (gameRes.matchedCount === 0) {
      throw new CustomHTTPError(404, 'Game of the post not found');
    }

    const postRes = await PostModel.deleteOne({ _id: post }).exec();
    if (postRes.deletedCount !== 1) {
      throw new CustomHTTPError(500, 'Error while trying to delete post');
    }

    log.info('Post successfully deleted');
    return res.status(200).json({ msg: 'Post successfully deleted', post });
  } catch (err) {
    next(err);
  }
};
