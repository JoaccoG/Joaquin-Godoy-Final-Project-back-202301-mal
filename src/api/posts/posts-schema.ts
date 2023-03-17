import mongoose, { Schema } from 'mongoose';
import { Game } from '../games/games-schema.js';
import { User } from '../users/users-schema.js';

export interface Post {
  user: User; // Required
  game: Game; // Required
  review: string; // Required
  rating: number; // Required
  photo: string;
  likes: number;
  date: Date;
}

const postSchema = new Schema<Post>({
  user: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  game: [{ type: Schema.Types.ObjectId, ref: 'Game' }],
  review: String,
  rating: Number,
  photo: String,
  likes: Number,
  date: Date,
});

export const PostModel = mongoose.model<Post>('Post', postSchema, 'posts');
