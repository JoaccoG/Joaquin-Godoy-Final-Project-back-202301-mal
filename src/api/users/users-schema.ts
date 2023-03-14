import mongoose, { Schema } from 'mongoose';
import { Game } from '../games/games-schema.js';
import { Post } from '../posts/posts-schema.js';

export interface User {
  email: string;
  password: string;
  name: string;
  surname: string;
  username: string;
  avatar: string;
  biography: string;
  posts: Post[];
  followers: User[];
  following: User[];
  favGames: Game[];
}

const userSchema = new Schema<User>({
  email: String,
  password: String,
  name: String,
  surname: String,
  username: String,
  avatar: String,
  biography: String,
  posts: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
  followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  favGames: [{ type: Schema.Types.ObjectId, ref: 'Game' }],
});

export const UserModel = mongoose.model<User>('User', userSchema, 'users');
