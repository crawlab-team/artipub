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

        // 平台
        platforms.forEach(platform => {
            if (req.body[platform]) {
                article.platforms[platform] = req.body[platform]
            }
        })

        // 更新
        article = await article.updateOne(article)

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
        const platforms = req.body.platforms.split(',')
        let isError = false
        let errMsg = ''
        for (let i = 0; i < platforms.length; i++) {
            if (isError) break
            const platform = platforms[i]

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

            // 初始化平台
            if (!article.platforms[platform]) {
                article.platforms[platform] = {}
            }

            // 初始化执行结果
            if (article.platforms[platform].url || article.platforms[platform].status === 'processing') {
                // 如果结果已经存在或状态为正在处理，跳过
                console.log(`skipped ${platform}`)
                continue
            } else {
                article.platforms[platform] = {
                    status: 'processing',
                    updateTs: new Date(),
                }
                await article.updateOne(article)
            }

            console.log(`node ${filePath} ${article._id.toString()}`)
            await exec(`node ${filePath} ${article._id.toString()}`, (err, stdout, stderr) => {
                if (err) {
                    console.error(stderr)
                    isError = true
                    errMsg = stderr
                    article.platforms[platform] = {
                        status: 'error',
                        updateTs: new Date(),
                        error: errMsg,
                    }
                    article.updateOne(article)
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
