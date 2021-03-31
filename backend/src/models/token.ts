import mongoose = require('mongoose')

const tokenSchema = new mongoose.Schema({
  accessToken: String,
  platformName: String,
  expiresTs: Date,
}, {
  timestamps: true
})

const Token = mongoose.model('tokens', tokenSchema)

export = Token
