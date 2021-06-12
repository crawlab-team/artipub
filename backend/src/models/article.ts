import { model, Schema, Model, Types, } from "mongoose";
import type {Document, ObjectId as IObjectId} from 'mongoose'
import type { ITask} from './task'
const ObjectId = require("bson").ObjectId;

export interface IAritcle extends Document, Timestamp, Record<'tasks', ITask[]> {
    user: Types.ObjectId;
  headerTpl: Types.ObjectId;
    tailTpl: IObjectId;
    title: string;
    content: string;
    contentHtml: string;
  platformIds: IObjectId[];
    readNum: number;
    likeNum: number;
    commentNum: number;
}

const articleSchema: Schema = new Schema(
  {
    user: { type: ObjectId, ref: "user" },
    headerTpl: { type: ObjectId, ref: "template" },
    tailTpl: { type: ObjectId, ref: "template" },
    title: String,
    content: String,
    contentHtml: String,
    platformIds: { type: Array, ref: "platforms" },
    readNum: Number,
    likeNum: Number,
    commentNum: Number,
  },
  {
    timestamps: true,
  }
);

articleSchema.index({ user: 1 }, { unique: false });

export interface IAritcleModel extends Model<IAritcle> {
}

export const Article = model<IAritcle>("article", articleSchema, 'article') as IAritcleModel;
