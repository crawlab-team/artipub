const mongoose = require('mongoose')

const articleSchema = new mongoose.Schema({
    title: String,
    content: String,
    contentHtml: String,
    platformIds: Array,
    createTs: Date,
    updateTs: Date,
})

const Article = mongoose.model('articles', articleSchema)

module.exports = Article
