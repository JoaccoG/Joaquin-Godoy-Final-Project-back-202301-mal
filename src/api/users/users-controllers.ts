import { RequestHandler } from 'express';
import { CustomHTTPError } from '../../errors/custom-http-error.js';
import { PostModel } from '../posts/posts-schema.js';
import { UserModel } from './users-schema.js';

export const getUserByIdController: RequestHandler = async (req, res, next) => {
  const user = req.params.idUser;

  try {
    const userData = await UserModel.findOne({ _id: user })
      .select('-password')
      .populate({ path: 'favGames', select: 'name banner' })
      .exec();

    if (userData === null) {
      throw new CustomHTTPError(404, 'User not found');
    }

    const userProfile = {
      _id: userData._id,
      username: userData.username,
      name: userData.name,
      surname: userData.surname,
      avatar: userData.avatar,
      biography: userData.biography,
      favGames: userData.favGames,
    };

    return res.status(200).json({
      msg: 'Successfully fetched user!',
      user: userProfile,
      userFollowersCount: userData.followers.length,
      userFollowingCount: userData.following.length,
    });
  } catch (err) {
    next(err);
  }
};

export const getUserPostsByIdController: RequestHandler<
  { idUser: string },
  unknown,
  unknown,
  {
    offset: number;
    limit: number;
  }
> = async (req, res, next) => {
  const { idUser } = req.params;
  const { offset, limit } = req.query;

  try {
    const postsCount = await PostModel.countDocuments({ user: idUser }).exec();

    const posts = await PostModel.find({ user: idUser })
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
