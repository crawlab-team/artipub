import { model, Schema, Types  } from "mongoose";
import type {Document, ObjectId as IObjectId} from 'mongoose'
import type { IPlatform } from "./platform"
import { JSONObject, Serializable } from "puppeteer-core";
const ObjectId = require("bson").ObjectId;

export interface ITask extends Document, Timestamp {
  articleId: Types.ObjectId;
  platformId: Types.ObjectId;
  user: Types.ObjectId;
  status: string;
  url: string;
  error: string | null;
  checked: boolean;
  ready: boolean;
  authType: string;
  readNum: number;
  likeNum: number;
  commentNum: number;

  category?: string;
  tag?: string;
  pubType?: string;
  title?: string;
  platform?: IPlatform;
}

const taskSchema = new Schema(
  {
    articleId: { type: ObjectId, ref: 'article' },
    platformId: { type: ObjectId, ref: 'platform' },
    user: { type: ObjectId, ref: 'user' },
    status: String,
    url: String,
    error: String,
    checked: Boolean,
    ready: Boolean,
    authType: String,
    readNum: Number,
    likeNum: Number,
    commentNum: Number,

    // 配置信息
    category: String, // 类别: juejin
    tag: String, // 标签: juejin (单选), segmentfault (逗号分割)
    pubType: String, // 发布形式: csdn (单选)
    title: String, // 标题

    // 前端数据（不用设置）
    platform: Object,
  },
  {
    timestamps: true,
  }
);

taskSchema.index({ user: 1, articleId: 1, platformId: 1 }, { unique: true });

export const Task = model<ITask>("task", taskSchema, 'task');
