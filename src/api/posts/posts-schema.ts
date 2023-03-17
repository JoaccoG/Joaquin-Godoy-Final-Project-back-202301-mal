import mongoose, { Schema } from 'mongoose';
import { Game } from '../games/games-schema.js';
import { User } from '../users/users-schema.js';

export interface Post {
  user: User;
  game: Game;
  review: string;
  rating: number;
  photo: string;
  likes: number;
  date: number;
}

const postSchema = new Schema<Post>({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  game: { type: Schema.Types.ObjectId, ref: 'Game' },
  review: String,
  rating: Number,
  photo: String,
  likes: Number,
  date: Number,
});

export const PostModel = mongoose.model<Post>('Post', postSchema, 'posts');
