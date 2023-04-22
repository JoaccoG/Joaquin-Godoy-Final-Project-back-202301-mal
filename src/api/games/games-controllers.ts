import { RequestHandler } from 'express';
import { GameModel } from './games-schema';
import { RequestQueryOffsetLimit } from '../../types/models';

export const getGamesController: RequestHandler<
  unknown,
  unknown,
  unknown,
  RequestQueryOffsetLimit
> = async (req, res, next) => {
  const { offset, limit } = req.query;

  try {
    const gamesCount = await GameModel.countDocuments().exec();

    const games = await GameModel.find({})
      .sort({ launch: -1 })
      .limit(limit)
      .skip(offset)
      .exec();

    return res.status(200).json({
      msg: 'Successfully fetched games!',
      count: gamesCount,
      games,
    });
  } catch (err) {
    next(err);
  }
};
