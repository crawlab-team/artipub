const models = require('../models')
const constants = require('../constants')
const ObjectId = require('bson').ObjectId
const exec = require('child_process').exec
const path = require('path')

module.exports = {
    getArticleList: async (req, res) => {
        const articles = await models.Article.find()
        for (let i = 0; i < articles.length; i++) {
            const article = articles[i]
            article.tasks = await models.Task.find({ articleId: article._id })
        }
        res.json({
            status: 'ok',
            data: articles
        })
    },
    getArticle: async (req, res) => {
        const article = await models.Article.findOne({ _id: ObjectId(req.params.id) })
        article.tasks = await models.Task.find({ articleId: article._id })
        res.json({
            status: 'ok',
            data: article
        })
    },
    getArticleTaskList: async (req, res) => {
        const article = await models.Article.findOne({ _id: ObjectId(req.params.id) })
        const tasks = await models.Task.find({ articleId: article._id })
        res.json({
            status: 'ok',
            data: tasks,
        })
    },
    addArticle: async (req, res) => {
        // 创建文章
        let article = new models.Article({
            title: req.body.title,
            content: req.body.content,
            platformIds: [],
            createTs: new Date(),
            updateTs: new Date(),
        })
        article = await article.save()
        res.json({
            status: 'ok',
            data: article,
        })
    },
    editArticle: async (req, res) => {
        let article = await models.Article.findOne({ _id: ObjectId(req.params.id) })
        if (!article) {
            return res.json({
                status: 'ok',
                error: 'not found'
            }, 404)
        }
        article.title = req.body.title
        article.content = req.body.content
        article.updateTs = new Date()
        article = await article.save()
        res.json({
            status: 'ok',
            data: article,
        })
    },
    deleteArticle: async (req, res) => {
        let article = await models.Article.findOne({ _id: ObjectId(req.params.id) })
        if (!article) {
            return res.json({
                status: 'ok',
                error: 'not found'
            }, 404)
        }
        await models.Article.remove({ _id: ObjectId(req.params.id) })
        res.json({
            status: 'ok',
            data: req.body,
        })
    },
    publishArticle: async (req, res) => {
        let article = await models.Article.findOne({ _id: ObjectId(req.params.id) })
        if (!article) {
            return res.json({
                status: 'ok',
                error: 'not found'
            }, 404)
        }
        const tasks = await models.Task.find({ articleId: article._id, checked: true })
        console.log(tasks);
        let isError = false
        let errMsg = ''
        for (let task of tasks) {
            if (isError) break

            // 获取平台
            const platform = await models.Platform.findOne({ _id: ObjectId(task.platformId) })

            // 获取执行路径
            let execPath
            if (platform === 'juejin') {
                execPath = 'juejin/juejin_spider.js'
            } else if (platform === 'segmentfault') {
                execPath = 'segmentfault/segmentfault_spider.js'
            } else if (platform === 'jianshu') {
                execPath = 'jianshu/jianshu_spider.js'
            } else {
                continue
            }
            const filePath = path.join(__dirname, '..', '..', 'spiders', execPath)

            // 更新任务
            task.status = constants.status.PROCESSING
            task.updateTs = new Date()
            await task.save()

            console.log(`node ${filePath} ${article._id.toString()}`)
            await exec(`node ${filePath} ${article._id.toString()}`, (err, stdout, stderr) => {
                if (err) {
                    console.error(stderr)
                    isError = true
                    errMsg = stderr
                    task.error = stderr
                    task.updateTs = new Date()
                    task.save()
                } else {
                    task.status = constants.status.FINISHED
                    task.updateTs = new Date()
                    task.save()
                }
            })
        }

        if (isError) {
            res.json({
                status: 'ok',
                error: errMsg,
            }, 500)
        } else {
            res.json({
                status: 'ok',
                data: article,
            })
        }
    },
    addArticleTask: async (req, res) => {
        let task = new models.Task({
            articleId: ObjectId(req.params.id),
            platformId: ObjectId(req.body.platformId),
            status: constants.status.NOT_STARTED,
            createTs: new Date(),
            updateTs: new Date(),
            category: req.body.category,
            tag: req.body.tag,
        })
        task = await task.save()
        res.json({
            status: 'ok',
            data: task,
        })
    },
}
