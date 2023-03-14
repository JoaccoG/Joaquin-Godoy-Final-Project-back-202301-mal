import mongoose, { Schema } from 'mongoose';
import { Post } from '../posts/posts-schema.js';

export interface Game {
  _id: string;
  name: string;
  photo: string;
  description: string;
  tags: string[];
  genre: string;
  mode: 'singleplayer' | 'multiplayer';
  studio: string;
  launch: Date;
  rating: Pick<Post, 'rating'>;
}

const gameSchema = new Schema<Game>({
  name: String,
  photo: String,
  description: String,
  tags: [String],
  genre: String,
  mode: String,
  studio: String,
  launch: Date,
  rating: Number,
});

export const GameModel = mongoose.model<Game>('Game', gameSchema, 'games');
