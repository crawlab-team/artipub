const mongoose = require('mongoose')

const articleSchema = new mongoose.Schema({
    title: String,
    content: String,
    createTs: Date,
    updateTs: Date,
    platforms: Object,
})

const Article = mongoose.model('articles', articleSchema)

module.exports = Article
