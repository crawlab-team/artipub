import mongoose = require('mongoose')
const {ObjectId} = require('bson')

const userPlatformSchema = new mongoose.Schema({
  user: { type: ObjectId, ref: 'users'},
  platform: { type: ObjectId, ref: 'platforms'},
  username: String,
  password: String,
  createTs: Date,
  updateTs: Date,
  loggedIn: Boolean,
   // 前端字段
   cookieStatus: String,
})

const UserPlatform = mongoose.model('user_platforms', userPlatformSchema)

export = UserPlatform
