const mongoose = require('mongoose')
const ObjectId = require('bson').ObjectId

const taskSchema = new mongoose.Schema({
    articleId: ObjectId,
    platform: String,
    status: String,
    url: String,
    createTs: Date,
    updateTs: Date,

    // 配置信息
    category: String, // 类别: juejin
    tag: String, // 标签: juejin (单选), segmentfault (逗号分割)
})

const Task = mongoose.model('tasks', taskSchema)

module.exports = Task
