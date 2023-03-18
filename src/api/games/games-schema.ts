import mongoose, { Schema } from 'mongoose';
import { Post } from '../posts/posts-schema';

export interface Game {
  name: string;
  banner: string;
  description: string;
  tags: string[];
  genre: string;
  mode: 'singleplayer' | 'multiplayer';
  studio: string;
  launch: Date;
  rating: number;
  posts: Post[];
}

const gameSchema = new Schema<Game>({
  name: String,
  banner: String,
  description: String,
  tags: [String],
  genre: String,
  mode: String,
  studio: String,
  launch: Date,
  rating: Number,
  posts: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
});

export const GameModel = mongoose.model<Game>('Game', gameSchema, 'games');
