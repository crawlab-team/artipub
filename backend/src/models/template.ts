import { model, Schema, Types,  } from "mongoose";
import type {Document, ObjectId as IObjectId} from "mongoose";
const ObjectId = require("bson").ObjectId;

export interface ITemplate extends Document, Timestamp {
  user: Types.ObjectId;
  name: string;
  content: string;
  contentHtml: string;
}

const templateSchema = new Schema(
  {
    user: ObjectId,
    name: String,
    content: String,
    contentHtml: String,
  },
  {
    timestamps: true,
  }
);

templateSchema.index({ user: 1 }, { unique: false });

export const Template = model<ITemplate>("template", templateSchema, 'template');
