import mongoose from 'mongoose';
import log from '../logger.js';

export const connectDB = (urlBD: string) => {
  mongoose.set('strictQuery', false);
  mongoose.set('debug', true);
  mongoose.set('toJSON', {
    virtuals: true,
    transform(_doc, ret) {
      delete ret.__v;
      delete ret.id;
    },
  });

  log.info('Successfully connected to database');
  return mongoose.connect(urlBD);
};
