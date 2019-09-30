import mongoose from 'mongoose';
import { IRequest } from '../types/Request';

const Request = new mongoose.Schema({
  domain: String,
  date: String,
  method: String,
  status: String,
});

export default mongoose.model<IRequest & mongoose.Document>('Request', Request);
