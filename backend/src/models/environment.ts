import mongoose = require('mongoose')
const {ObjectId} = require('bson')

const environmentSchema = new mongoose.Schema({
  _id: String,  // key
  user: ObjectId,
  label: String,  // label
  value: String,  // value
  updateTs: Date,
  createTs: Date,
})

const Environment = mongoose.model('environments', environmentSchema)

export = Environment
