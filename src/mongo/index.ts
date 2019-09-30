import { Db } from 'mongodb';
import mongoose from 'mongoose';

const MONGO_CONNECTION = 'mongodb://localhost:27017/proxy-server';

export default async (): Promise<Db> => {
  const connection = await mongoose.connect(MONGO_CONNECTION, { useNewUrlParser: true, useCreateIndex: true });
  return connection.connection.db;
};
