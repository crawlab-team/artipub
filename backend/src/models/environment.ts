import mongoose = require('mongoose')
const {ObjectId} = require('bson')

const environmentSchema = new mongoose.Schema({
  _id: ObjectId,  // key
  user: ObjectId,
  name: String,
  label: String,  // label
  value: String,  // value
}, {
  timestamps: true
})

environmentSchema.index({ user: 1, name: 1 }, { unique: true });

const Environment = mongoose.model('environments', environmentSchema)

export = Environment
