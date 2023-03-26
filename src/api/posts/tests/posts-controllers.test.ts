import { Request, Response } from 'express';
import { RequestQueryOffsetLimit, UserLocalsId } from '../../../types/models';
import { GameModel } from '../../games/games-schema';
import {
  createNewPostController,
  deletePostController,
  getAllPostsController,
} from '../posts-controllers';
import { Post, PostModel } from '../posts-schema';
import { UserModel } from '../../users/users-schema';
import { mockedPosts } from './utils';
import { CustomHTTPError } from '../../../errors/custom-http-error';

jest.mock('@supabase/supabase-js', () => {
  const data = {
    publicUrl: 'https://example.com/photo.png',
  };
  return {
    createClient: jest.fn().mockImplementation(() => ({
      storage: {
        from: jest.fn().mockReturnValue({
          upload: jest.fn().mockResolvedValue({
            error: null,
            data: {
              ...data,
            },
          }),
          getPublicUrl: jest.fn().mockReturnValue({
            error: null,
            data: {
              ...data,
            },
          }),
          remove: jest.fn().mockResolvedValue({
            error: null,
            data: {},
          }),
        }),
      },
    })),
  };
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Given the posts entity controllers', () => {
  const next = jest.fn();

  describe('When a request to create a new post is made', () => {
    const request = {
      body: { review: 'mockedReview', rating: 3 },
      file: { buffer: Buffer.from('mockedBuffer') },
    } as Partial<
      Request<
        unknown,
        unknown,
        Pick<Post, 'game' | 'review' | 'rating'>,
        unknown,
        UserLocalsId
      >
    >;
    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { id: 'mockedId' },
    } as Partial<Response>;
    PostModel.create = jest.fn().mockImplementation(() => ({
      populate: jest.fn().mockResolvedValue(mockedPosts[0]),
    }));
    GameModel.findOne = jest.fn().mockImplementation(() => ({
      exec: jest.fn().mockResolvedValue({ _id: 'game_id' }),
    }));
    UserModel.updateOne = jest.fn().mockImplementation(() => ({
      exec: jest.fn().mockResolvedValue({ matchedCount: 1 }),
    }));
    GameModel.updateOne = jest.fn().mockImplementation(() => ({
      exec: jest.fn().mockResolvedValue({ matchedCount: 1 }),
    }));

    test('Then the post should be created', async () => {
      await createNewPostController(
        request as Request<
          unknown,
          unknown,
          Pick<Post, 'game' | 'review' | 'rating'>,
          unknown,
          UserLocalsId
        >,
        response as Response<{ msg: string; post: Post }, { id: string }>,
        next,
      );
      await expect(response.status).toHaveBeenCalledWith(201);
    });

    test('But no file on buffer is found, then the post should be created with no photo', async () => {
      const noBufferRequest = {
        body: { review: 'mockedReview', rating: 3 },
        file: undefined,
      } as Partial<
        Request<
          unknown,
          unknown,
          Pick<Post, 'game' | 'review' | 'rating'>,
          unknown,
          UserLocalsId
        >
      >;
      await createNewPostController(
        noBufferRequest as Request<
          unknown,
          unknown,
          Pick<Post, 'game' | 'review' | 'rating'>,
          unknown,
          UserLocalsId
        >,
        response as Response<{ msg: string; post: Post }, { id: string }>,
        next,
      );
      await expect(response.status).toHaveBeenCalledWith(201);
    });

    test('But the post-related game is not found, then an error should be thrown', async () => {
      GameModel.updateOne = jest.fn().mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue({ matchedCount: 0 }),
      }));
      await createNewPostController(
        request as Request<
          unknown,
          unknown,
          Pick<Post, 'game' | 'review' | 'rating'>,
          unknown,
          UserLocalsId
        >,
        response as Response<{ msg: string; post: Post }, { id: string }>,
        next,
      );
      await expect(next).toHaveBeenCalledWith(
        new CustomHTTPError(404, 'Game to update not found'),
      );
    });

    test('But the post-related user is not found, then an error should be thrown', async () => {
      UserModel.updateOne = jest.fn().mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue({ matchedCount: 0 }),
      }));
      await createNewPostController(
        request as Request<
          unknown,
          unknown,
          Pick<Post, 'game' | 'review' | 'rating'>,
          unknown,
          UserLocalsId
        >,
        response as Response<{ msg: string; post: Post }, { id: string }>,
        next,
      );
      await expect(next).toHaveBeenCalledWith(
        new CustomHTTPError(404, 'User to update not found'),
      );
    });

    test('But the game about the post is not found, then an error should be thrown', async () => {
      GameModel.findOne = jest.fn().mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue(null),
      }));
      await createNewPostController(
        request as Request<
          unknown,
          unknown,
          Pick<Post, 'game' | 'review' | 'rating'>,
          unknown,
          UserLocalsId
        >,
        response as Response<{ msg: string; post: Post }, { id: string }>,
        next,
      );
      await expect(next).toHaveBeenCalledWith(
        new CustomHTTPError(404, 'Game to rate not found'),
      );
    });
  });

  describe('When a request to get posts is made', () => {
    const request = {
      query: { offset: 0, limit: 3 },
    } as Partial<Request<unknown, unknown, unknown, RequestQueryOffsetLimit>>;
    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as Partial<Response>;
    PostModel.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(mockedPosts),
    });
    PostModel.countDocuments = jest.fn().mockImplementation(() => ({
      exec: jest.fn().mockResolvedValue(2),
    }));

    test('Then the response should contain a list of posts', async () => {
      await getAllPostsController(
        request as Request<unknown, unknown, unknown, RequestQueryOffsetLimit>,
        response as Response,
        next,
      );

      await expect(response.status).toHaveBeenCalledWith(200);
    });

    test('But there is an error while finding the posts, then an error should be thrown', async () => {
      PostModel.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('mockedError')),
      });

      await getAllPostsController(
        request as Request<unknown, unknown, unknown, RequestQueryOffsetLimit>,
        response as Response,
        next,
      );

      await expect(next).toHaveBeenCalled();
    });
  });

  describe('When a request to delete a post is made', () => {
    const request = {
      params: { idPost: 'post_id' },
    } as Partial<
      Request<{ idPost: string }, unknown, unknown, unknown, UserLocalsId>
    >;
    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { id: 'user_id1' },
    } as Partial<Response>;
    PostModel.findOne = jest.fn().mockImplementation(() => ({
      exec: jest.fn().mockResolvedValue(mockedPosts[0]),
    }));

    test('Then the post should be deleted', async () => {
      UserModel.updateOne = jest.fn().mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue({ matchedCount: 1 }),
      }));
      GameModel.updateOne = jest.fn().mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue({ matchedCount: 1 }),
      }));
      PostModel.deleteOne = jest.fn().mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue({ deletedCount: 1 }),
      }));
      await deletePostController(
        request as Request<
          { idPost: string },
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

    test('But there is an error while deleting the post, then an error should be thrown', async () => {
      PostModel.deleteOne = jest.fn().mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue({ deletedCount: 0 }),
      }));
      await deletePostController(
        request as Request<
          { idPost: string },
          unknown,
          unknown,
          unknown,
          UserLocalsId
        >,
        response as Response<unknown, UserLocalsId>,
        next,
      );

      await expect(next).toHaveBeenCalled();
    });

    test('But no game related to the post is found, then an error should be thrown', async () => {
      GameModel.updateOne = jest.fn().mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue({ matchedCount: 0 }),
      }));
      await deletePostController(
        request as Request<
          { idPost: string },
          unknown,
          unknown,
          unknown,
          UserLocalsId
        >,
        response as Response<unknown, UserLocalsId>,
        next,
      );

      await expect(next).toHaveBeenCalled();
    });

    test('But no user related to the post is found, then an error should be thrown', async () => {
      UserModel.updateOne = jest.fn().mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue({ matchedCount: 0 }),
      }));
      await deletePostController(
        request as Request<
          { idPost: string },
          unknown,
          unknown,
          unknown,
          UserLocalsId
        >,
        response as Response<unknown, UserLocalsId>,
        next,
      );

      await expect(next).toHaveBeenCalled();
    });

    test('But the post to delete is not found, then an error should be thrown', async () => {
      PostModel.findOne = jest.fn().mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue(null),
      }));
      await deletePostController(
        request as Request<
          { idPost: string },
          unknown,
          unknown,
          unknown,
          UserLocalsId
        >,
        response as Response<unknown, UserLocalsId>,
        next,
      );

      await expect(next).toHaveBeenCalled();
    });

    test('But the request is being made by someone else than the post creator, then an error should be thrown', async () => {
      PostModel.findOne = jest.fn().mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue(mockedPosts[1]),
      }));
      await deletePostController(
        request as Request<
          { idPost: string },
          unknown,
          unknown,
          unknown,
          UserLocalsId
        >,
        response as Response<unknown, UserLocalsId>,
        next,
      );

      await expect(next).toHaveBeenCalled();
    });
  });
});
