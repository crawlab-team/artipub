import mongoose = require('mongoose')
const ObjectId = require('bson').ObjectId;


const articleSchema = new mongoose.Schema({
    user: ObjectId,
    title: String,
    content: String,
    contentHtml: String,
    platformIds: Array,
    readNum: Number,
    likeNum: Number,
    commentNum: Number,
}, {
    timestamps: true
})

const Article = mongoose.model('articles', articleSchema)

export = Article
