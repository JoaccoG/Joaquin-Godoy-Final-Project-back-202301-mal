import mongoose, { Schema } from 'mongoose';
import { Game } from '../games/games-schema.js';
import { User } from '../users/users-schema.js';

export interface Post {
  _id: string;
  userId: Pick<User, 'username'>;
  gameId: Pick<Game, 'name'>;
  opinion: string;
  rating: number;
  likes: number;
  date: Date;
}

const postSchema = new Schema<Post>({
  userId: String,
  gameId: String,
  opinion: String,
  rating: Number,
  likes: Number,
  date: Date,
});

export const PostModel = mongoose.model<Post>('Post', postSchema, 'posts');
