import mongoose = require('mongoose')

const tokenSchema = new mongoose.Schema({
  accessToken: String,
  platformName: String,
  expiresTs: Date,
  createTs: Date,
  updateTs: Date,
})

const Token = mongoose.model('tokens', tokenSchema)

export = Token
