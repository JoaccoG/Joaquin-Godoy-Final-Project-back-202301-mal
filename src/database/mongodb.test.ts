import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { PostModel } from '../api/posts/posts-schema';
import { connectDB } from './mongodb';

describe('Given a database connection', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUrl = mongoServer.getUri();
    await connectDB(mongoUrl);
  });
  afterAll(async () => {
    await mongoServer.stop();
    await mongoose.connection.close();
  });

  describe('When the transform options are defined', () => {
    it('Then it should delete __v and id from the returned objects', async () => {
      const doc = new PostModel({ review: 'Test review', rating: 3 });
      await doc.save();

      const transformedDoc = (doc as mongoose.Document).toJSON();

      expect(transformedDoc.__v).toBeUndefined();
      expect(transformedDoc.id).toBeUndefined();
    });
  });
});
