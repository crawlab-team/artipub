import mongoose = require('mongoose')
const {ObjectId} = require('bson')

const userPlatformSchema = new mongoose.Schema({
  user: { type: ObjectId, ref: 'users'},
  platform: { type: ObjectId, ref: 'platforms'},
  username: String,
  password: String,
  loggedIn: Boolean,
   // 前端字段
   cookieStatus: String,
}, {
  timestamps: true
})

userPlatformSchema.index({ user: 1, platform: 1 }, {unique: true})

const UserPlatform = mongoose.model('user_platforms', userPlatformSchema)

export = UserPlatform
