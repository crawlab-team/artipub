import { model, Schema, Model, } from "mongoose";
import type {Document, ObjectId as IObjectId} from 'mongoose'
import type { ITask} from './task'
const ObjectId = require("bson").ObjectId;

export interface IAritcle extends Document, Timestamp, Record<'tasks', ITask[]> {
    user: IObjectId;
    headerTpl: IObjectId;
    footerTpl: IObjectId;
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
    user: ObjectId,
    headerTpl: ObjectId,
    footerTpl: ObjectId,
    title: String,
    content: String,
    contentHtml: String,
    platformIds: Array,
    readNum: Number,
    likeNum: Number,
    commentNum: Number,
  },
  {
    timestamps: true,
  }
);

export interface IAritcleModel extends Model<IAritcle> {
}

export const Article = model<IAritcle>("articles", articleSchema) as IAritcleModel;
