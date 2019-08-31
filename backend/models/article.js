const mongoose = require('mongoose')

const articleSchema = new mongoose.Schema({
    title: String,
    content: String,
    createTs: Date,
    updateTs: Date,
    tasks: Array,
})

const Article = mongoose.model('articles', articleSchema)

module.exports = Article
