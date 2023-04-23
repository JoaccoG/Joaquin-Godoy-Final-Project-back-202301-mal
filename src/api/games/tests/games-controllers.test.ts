import { Request, Response } from 'express';
import { RequestQueryOffsetLimit } from '../../../types/models';
import { GameModel } from '../games-schema';
import { mockedGames } from './utils';
import { getGamesController } from '../games-controllers';

describe('Given the games entity controllers', () => {
  const next = jest.fn();

  describe('When a request to get games is made', () => {
    const request = {
      query: { offset: 0, limit: 3 },
    } as Partial<Request<unknown, unknown, unknown, RequestQueryOffsetLimit>>;
    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as Partial<Response>;
    GameModel.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(mockedGames),
    });
    GameModel.countDocuments = jest.fn().mockImplementation(() => ({
      exec: jest.fn().mockResolvedValue(2),
    }));

    test('Then the response should be a 200', async () => {
      await getGamesController(
        request as Request<unknown, unknown, unknown, RequestQueryOffsetLimit>,
        response as Response,
        next,
      );
      expect(response.status).toHaveBeenCalledWith(200);
    });

    test('But the limit query param is greater than 10, then an error should be thrown', async () => {
      const request = {
        query: { offset: 0, limit: 11 },
      } as Partial<Request<unknown, unknown, unknown, RequestQueryOffsetLimit>>;
      await getGamesController(
        request as Request<unknown, unknown, unknown, RequestQueryOffsetLimit>,
        response as Response,
        next,
      );
      await expect(next).toHaveBeenCalled();
    });
  });
});
