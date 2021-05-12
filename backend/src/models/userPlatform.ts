import { model, Schema, Types  } from "mongoose";
import type {Document, ObjectId as IObjectId} from "mongoose";
const { ObjectId } = require("bson");

export interface IUserPlatform extends Document, Timestamp {
  user: Types.ObjectId;
  platform: Types.ObjectId;
  username: string;
  password: string;
  loggedIn: boolean;
  cookieStatus: string;
}

const userPlatformSchema = new Schema(
  {
    user: { type: ObjectId, ref: "users" },
    platform: { type: ObjectId, ref: "platforms" },
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
  "user_platforms",
  userPlatformSchema
);
