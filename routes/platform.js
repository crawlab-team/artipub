const models = require('../models')
const ObjectId = require('bson').ObjectId

module.exports = {
    getPlatformList: async (req, res) => {
        const platforms = await models.Platform.find()
        await res.json({
            status: 'ok',
            data: platforms
        })
    },
    getPlatform: async (req, res) => {
        const platform = await models.Platform.findOne({ _id: ObjectId(req.params.id) })
        await res.json({
            status: 'ok',
            data: platform
        })
    },
    addPlatform: async (req, res) => {
        let Platform = new models.Platform({
            name: req.body.name,
            label: req.body.label,
            editorType: req.body.editorType,
            description: req.body.description,
            enableImport: req.body.enableImport,
            createTs: new Date(),
            updateTs: new Date()
        })
        Platform = await Platform.save()
        await res.json({
            status: 'ok',
            data: Platform
        })
    },
    editPlatform: async (req, res) => {
        let platform = await models.Platform.findOne({ _id: ObjectId(req.params.id) })
        if (!platform) {
            return await res.json({
                status: 'ok',
                error: 'not found'
            }, 404)
        }
        platform.name = req.body.name
        platform.label = req.body.label
        platform.editorType = req.body.editorType
        platform.description = req.body.description
        platform.enableImport = req.body.enableImport
        platform.updateTs = new Date()
        platform.save()
        await res.json({
            status: 'ok',
            data: platform
        })
    },
    deletePlatform: async (req, res) => {
        let platform = await models.Platform.findOne({ _id: ObjectId(req.params.id) })
        if (!platform) {
            return await res.json({
                status: 'ok',
                error: 'not found'
            }, 404)
        }
        await models.Platform.remove({ _id: ObjectId(req.params.id) })
        await res.json({
            status: 'ok',
            data: platform
        })
    },
    getPlatformArticles: async (req, res) => {
        // 获取平台
        const platform = await models.Platform.findOne({ _id: ObjectId(req.params.id) })

        // 如果平台不存在，返回404错误
        if (!platform) {
            return await res.json({
                status: 'ok',
                error: 'not found'
            }, 404)
        }

        // 获取导入爬虫类
        const ImportSpider = require('../spiders/import/' + platform.name)

        // 导入爬虫实例
        const spider = new ImportSpider(platform.name)

        // 获取网站文章列表
        const siteArticles = await spider.fetch()

        // 遍历网站文章列表
        for (let i = 0; i < siteArticles.length; i++) {
            // 当前网站文章
            const siteArticle = siteArticles[i]

            // 根据title查找数据库中文章
            const article = await models.Article.findOne({ title: siteArticle.title })

            // 网站文章是否存在
            siteArticles[i].exists = !!article

            // 尝试查找网站文章关联的任务
            let task
            if (article) {
                siteArticles[i].articleId = article._id
                task = await models.Task.findOne({ platformId: platform._id, articleId: article._id })
            }

            // 网站文章是否已关联
            siteArticles[i].associated = !!(task && task.url && task.url === siteArticle.url)
        }

        // 返回结果
        await res.json({
            status: 'ok',
            data: siteArticles
        })
    },
    importPlatformArticles: async (req, res) => {
        // 获取平台
        const platform = await models.Platform.findOne({ _id: ObjectId(req.params.id) })

        // 如果平台不存在，返回404错误
        if (!platform) {
            return await res.json({
                status: 'ok',
                error: 'not found'
            }, 404)
        }

        // 获取导入爬虫类
        const ImportSpider = require('../spiders/import/' + platform.name)

        // 导入爬虫实例
        const spider = new ImportSpider(platform.name)

        // 获取网站文章列表
        const siteArticles = req.body

        // 开始导入
        await spider.import(siteArticles)

        // 返回结果
        await res.json({
            status: 'ok'
        })
    }
}
