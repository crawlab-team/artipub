import { model, Schema, Types, } from 'mongoose';
import type {Document, ObjectId as IObjectId} from 'mongoose'
const {ObjectId} = require('bson')

export interface IEnvironment extends Document, Timestamp {
  user: Types.ObjectId;
  name: string;
  label: string;
  value: string;
}

const environmentSchema = new Schema({
  user: { type: ObjectId, ref: 'user' },
  name: String,
  label: String,  // label
  value: String,  // value
}, {
  timestamps: true
})

environmentSchema.index({ user: 1, }, { unique: false });

environmentSchema.index({ user: 1, name: 1 }, { unique: true });

export const Environment = model<IEnvironment>('environment', environmentSchema, 'environment')
