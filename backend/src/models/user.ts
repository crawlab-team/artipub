import { model, Schema,  } from "mongoose";
import type {Document, ObjectId as IObjectId} from "mongoose";
const pwdLM = require("passport-local-mongoose");
const passport = require("passport");

export interface IUser extends Document, Timestamp {
  email: string;
  username: string;
  salt: string;
  hash: string;
  lastLogin: Date;
  attempts: number;
}
const UserSchema = new Schema(
  {
    email: {
      required: true,
      type: String,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.plugin(pwdLM, {
  lastLoginField: "lastLogin",
  limitAttempts: true,
  maxAttempts: 4,
  errorMessages: {
    MissingPasswordError: "密码缺失",
    AttemptTooSoonError: "账号被锁，稍后重试",
    TooManyAttemptsError: "账号被锁，太多失败登录",
    NoSaltValueStoredError: "无法认证，缺失加密盐值",
    IncorrectPasswordError: "账号密码不匹配",
    IncorrectUsernameError: "账号密码不匹配",
    MissingUsernameError: "用户名缺失",
    UserExistsError: "用户已存在",
  },
});

export const User = model<IUser>("user", UserSchema, 'user');

//@ts-ignore
passport.use(User.createStrategy());
