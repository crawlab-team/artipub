import { model, Schema, Types  } from "mongoose";
import type {Document, ObjectId as IObjectId} from "mongoose";
import { IPlatform } from "./platform";
const { ObjectId } = require("bson");

export interface IUserPlatform extends Document, Timestamp {
  user: Types.ObjectId;
  platform: Types.ObjectId | IPlatform;
  username: string;
  password: string;
  loggedIn: boolean;
  cookieStatus: string;
}

const userPlatformSchema = new Schema(
  {
    user: { type: ObjectId, ref: "user" },
    platform: { type: ObjectId, ref: "platform" },
    username: String,
    password: String,
    loggedIn: Boolean,
    // 前端字段
    cookieStatus: String,
  },
  {
    timestamps: true,
  }
);

userPlatformSchema.index({ user: 1, platform: 1 }, { unique: true });

export const UserPlatform = model<IUserPlatform>(
  "user_platform",
  userPlatformSchema,
  'user_platform'
);
