import mongoose from 'mongoose';
import log from '../logger.js';

export const connectDB = (urlBD: string) => {
  try {
    mongoose.set('strictQuery', false);
    mongoose.set('debug', true);
    mongoose.set('toJSON', {
      virtuals: true,
      transform(_doc, ret) {
        delete ret.__v;
      },
    });

    log.info('Successfully connected to database');
    return mongoose.connect(urlBD);
  } catch (error) {
    log.error('Error connecting to database');
    throw new Error(`Error: ${error}`);
  }
};
