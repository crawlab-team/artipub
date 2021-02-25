const mongoose = require('mongoose')

const platformSchema = new mongoose.Schema({
  name: String,
  label: String,
  editorType: String,
  description: String,
  url: String,
  enableImport: Boolean,
  enableLogin: Boolean,
  username: String,
  password: String,
  createTs: Date,
  updateTs: Date,
  loggedIn: Boolean,

  // 前端字段
  cookieStatus: String,
})

const Platform = mongoose.model('platforms', platformSchema)

module.exports = Platform
