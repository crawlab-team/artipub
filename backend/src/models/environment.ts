import { model, Schema, } from 'mongoose';
import type {Document, ObjectId as IObjectId} from 'mongoose'
const {ObjectId} = require('bson')

export interface IEnvironment extends Document, Timestamp {
  user: IObjectId;
  name: string;
  label: string;
  value: string;
}

const environmentSchema = new Schema({
  user: ObjectId,
  name: String,
  label: String,  // label
  value: String,  // value
}, {
  timestamps: true
})

environmentSchema.index({ user: 1, name: 1 }, { unique: true });

export const Environment = model<IEnvironment>('environments', environmentSchema)
