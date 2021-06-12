import { model, Schema, Types,  } from "mongoose";
import type {Document, } from 'mongoose';
const ObjectId = require("bson").ObjectId;

export interface ICookie extends Document, Timestamp{
  user: Types.ObjectId;
  domain: string;
  name: string;
  value: string;
  session: boolean;
  hostOnly: boolean;
  expirationDate: number;
  path: string;
  httpOnly: boolean;
  secure: boolean;
}

const cookieSchema = new Schema(
  {
    user: {type: ObjectId, ref: 'user'},
    /** The domain of the cookie (e.g. "www.google.com", "example.com"). */
    domain: String,
    /** The name of the cookie. */
    name: String,
    /** The value of the cookie. */
    value: String,
    /** True if the cookie is a session cookie, as opposed to a persistent cookie with an expiration date. */
    session: Boolean,
    /** True if the cookie is a host-only cookie (i.e. a request's host must exactly match the domain of the cookie). */
    hostOnly: Boolean,
    /** Optional. The expiration date of the cookie as the number of seconds since the UNIX epoch. Not provided for session cookies.  */
    expirationDate: Number,
    /** The path of the cookie. */
    path: String,
    /** True if the cookie is marked as HttpOnly (i.e. the cookie is inaccessible to client-side scripts). */
    httpOnly: Boolean,
    /** True if the cookie is marked as Secure (i.e. its scope is limited to secure channels, typically HTTPS). */
    secure: Boolean,
  },
  {
    timestamps: true,
  }
);

cookieSchema.index({ user: 1 }, { unique: false });

export const Cookie = model<ICookie>("cookies", cookieSchema, 'cookies');
