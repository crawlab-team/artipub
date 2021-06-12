import { model, Schema,  } from "mongoose";
import type {Document, ObjectId as IObjectId} from 'mongoose'

export interface IToken extends Document, Timestamp {
  accessToken: string;
  platformName: string;
  expiresTs: Date;
}

const tokenSchema = new Schema(
  {
    accessToken: String,
    platformName: String,
    expiresTs: Date,
  },
  {
    timestamps: true,
  }
);

export const Token = model<IToken>("token", tokenSchema, 'token');
