import { Request, Response } from 'express';
import { UserModel } from '../users-schema';
import { mockedUsers } from './utils';
import {
  getUserByIdController,
  getUserPostsByIdController,
} from '../users-controllers';
import {
  RequestParamsUserId,
  RequestQueryOffsetLimit,
  UserLocalsId,
} from '../../../types/models';
import { CustomHTTPError } from '../../../errors/custom-http-error';
import { PostModel } from '../../posts/posts-schema';
import { mockedPosts } from '../../posts/tests/utils';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Given the users entity controllers', () => {
  const next = jest.fn();

  describe('When a request to get user profile data is made', () => {
    const request = {
      params: {
        idUser: '123456',
      },
      locals: {
        id: '123456',
      },
    } as Partial<
      Request<RequestParamsUserId, unknown, unknown, unknown, UserLocalsId>
    >;
    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        id: '123456',
      },
    } as Partial<Response>;

    test('Then it should return the user data', async () => {
      UserModel.findOne = jest.fn().mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockedUsers[0]),
      }));

      await getUserByIdController(
        request as Request<
          RequestParamsUserId,
          unknown,
          unknown,
          unknown,
          UserLocalsId
        >,
        response as Response<unknown, UserLocalsId>,
        next,
      );
      await expect(response.status).toHaveBeenCalledWith(200);
    });

    test('But no user is found, then an error should be thrown', async () => {
      UserModel.findOne = jest.fn().mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      }));

      await getUserByIdController(
        request as Request<
          RequestParamsUserId,
          unknown,
          unknown,
          unknown,
          UserLocalsId
        >,
        response as Response<unknown, UserLocalsId>,
        next,
      );
      await expect(next).toHaveBeenCalledWith(
        new CustomHTTPError(404, 'User not found'),
      );
    });
  });

  describe('When a request to get a user posts is made', () => {
    const request = {
      params: {
        idUser: '123456',
      },
      query: {
        offset: 0,
        limit: 4,
      },
    } as Partial<
      Request<RequestParamsUserId, unknown, unknown, RequestQueryOffsetLimit>
    >;
    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as Partial<Response>;

    test('Then it should return the user posts', async () => {
      PostModel.countDocuments = jest.fn().mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue(2),
      }));
      PostModel.find = jest.fn().mockImplementation(() => ({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockedPosts),
      }));

      await getUserPostsByIdController(
        request as Request<
          RequestParamsUserId,
          unknown,
          unknown,
          RequestQueryOffsetLimit
        >,
        response as Response,
        next,
      );
      await expect(response.status).toHaveBeenCalledWith(200);
    });

    test('But no user is found, then an error should be thrown', async () => {
      PostModel.countDocuments = jest.fn().mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue(0),
      }));
      PostModel.find = jest.fn().mockImplementation(() => ({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      }));

      await getUserPostsByIdController(
        request as Request<
          RequestParamsUserId,
          unknown,
          unknown,
          RequestQueryOffsetLimit
        >,
        response as Response,
        next,
      );
      await expect(next).toHaveBeenCalledWith(
        new CustomHTTPError(404, 'User posts not found'),
      );
    });
  });
});
