const mongoose = require('mongoose')

const environmentSchema = new mongoose.Schema({
  _id: String,  // key
  label: String,  // label
  value: String,  // value
  updateTs: Date,
  createTs: Date,
})

const Environment = mongoose.model('environments', environmentSchema)

module.exports = Environment
