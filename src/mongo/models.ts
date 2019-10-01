import mongoose from 'mongoose';
import { IRequest } from '../types/Request';

const Request = new mongoose.Schema({
  hostname: String,
  port: String,
  path: String,
  method: String,
  headers: Object,
  date: String,
});

export const RequestModel = mongoose.model<IRequest & mongoose.Document>('Request', Request);

export default async (
  {
    hostname,
    port,
    path,
    method,
    headers,
    date,
  }
) => {
  const request = new RequestModel({
    hostname,
    port,
    path,
    method,
    headers,
    date,
  });

  await request.save();
  console.log(`Request to ${hostname} successfully added to db`);
};
