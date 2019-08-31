const mongoose = require('mongoose')

const platformSchema = new mongoose.Schema({
    name: String,
    label: String,
    description: String,
    createTs: Date,
    updateTs: Date,
})

const Task = mongoose.model('platforms', platformSchema)

module.exports = Task
