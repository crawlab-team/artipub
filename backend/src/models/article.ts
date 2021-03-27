import mongoose = require('mongoose')
const ObjectId = require('bson').ObjectId;


const articleSchema = new mongoose.Schema({
    user: ObjectId,
    title: String,
    content: String,
    contentHtml: String,
    platformIds: Array,
    createTs: Date,
    updateTs: Date,
    readNum: Number,
    likeNum: Number,
    commentNum: Number,
})

const Article = mongoose.model('articles', articleSchema)

export = Article
