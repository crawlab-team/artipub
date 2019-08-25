const models = require('../models')
const ObjectId = require('bson').ObjectId

module.exports = {
    getArticleList: async (req, res) => {
        const articles = await models.Article.find()
        res.json({
            status: 'ok',
            data: articles
        })
    },
    getArticle: async (req, res) => {
        const article = await models.Article.findOne({ _id: ObjectId(req.params.id) })
        res.json({
            status: 'ok',
            data: article
        })
    },
    addArticle: async (req, res) => {
        let article = new models.Article({
            title: req.body.title,
            content: req.body.content,
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
    }
}
