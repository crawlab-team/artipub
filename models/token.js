const mongoose = require('mongoose')
const ObjectId = require('bson').ObjectId

const tokenSchema = new mongoose.Schema({
  accessToken: String,
  platformName: String,
  expiresTs: Date,
  createTs: Date,
  updateTs: Date,
})

const Token = mongoose.model('tokens', tokenSchema)

module.exports = Token
