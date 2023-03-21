import { Request, Response } from 'express';
import { UserLocalsId } from '../../../types/models';
import { GameModel } from '../../games/games-schema';
import { UserModel } from '../../users/users-schema';
import {
  createNewPostController,
  getAllPostsController,
} from '../posts-controllers';
import { Post, PostModel } from '../posts-schema';

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
        }),
      },
    })),
  };
});

describe('Given the posts entity controllers', () => {
  const next = jest.fn();

  describe('When a request to create a post is made', () => {
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

    const mockPost = { _id: 'post_id' };
    PostModel.create = jest.fn().mockImplementation(() => ({
      populate: jest.fn().mockResolvedValue(mockPost),
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
      await expect(next).toHaveBeenCalled();
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
      await expect(next).toHaveBeenCalled();
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
      await expect(next).toHaveBeenCalled();
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
  });
  describe('When a request to get a post is made', () => {
    const request = {} as Request;
    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as Partial<Response>;

    test('Then the response should be the list of posts', async () => {
      const mockPosts = [{ _id: 'post1' }, { _id: 'post2' }];
      PostModel.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockPosts),
      });
      await getAllPostsController(request, response as Response, next);
      await expect(response.status).toHaveBeenCalledWith(200);
    });

    test('But there is an error while finding the posts, then an error should be thrown', async () => {
      const mockPosts = [{ _id: 'post1' }, { _id: 'post2' }];
      PostModel.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockRejectedValue(mockPosts),
      });
      await getAllPostsController(request, response as Response, next);
      await expect(next).toHaveBeenCalled();
    });
  });
});
