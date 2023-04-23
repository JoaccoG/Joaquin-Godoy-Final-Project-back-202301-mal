import { RequestHandler } from 'express';
import { GameModel } from './games-schema.js';
import { RequestQueryOffsetLimit } from '../../types/models.js';
import { CustomHTTPError } from '../../errors/custom-http-error.js';

export const getGamesController: RequestHandler<
  unknown,
  unknown,
  unknown,
  RequestQueryOffsetLimit
> = async (req, res, next) => {
  const { offset, limit } = req.query;

  try {
    if (!limit || limit > 10) {
      throw new CustomHTTPError(
        400,
        'Query parameter "limit" is missing or is greater than 10',
      );
    }

    const gamesCount = await GameModel.countDocuments().exec();

    const games = await GameModel.find({})
      .sort({ launch: -1 })
      .limit(limit)
      .skip(offset)
      .select('_id name banner')
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
