import mongoose = require('mongoose')

const platformSchema = new mongoose.Schema({
  name: String,
  label: String,
  editorType: String,
  description: String,
  url: String,
  enableImport: Boolean,
  enableLogin: Boolean,
  createTs: Date,
  updateTs: Date,
  loggedIn: Boolean,

 
})

const Platform = mongoose.model('platforms', platformSchema)

export = Platform
