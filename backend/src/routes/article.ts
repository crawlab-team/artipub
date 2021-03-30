import { Router } from 'express'
import models from '../models'
import * as Result from '../utils/result'
import constants from '../constants'
const ObjectId = require('bson').ObjectId
const router = Router();

const getArticleList = async (req, res) => {
    const articles = await models.Article.find({user: req.user._id}).sort({ _id: -1 })
    for (let i = 0; i < articles.length; i++) {
      const article = articles[i]
      article.tasks = await models.Task.find({ articleId: article._id })
      const arr = ['readNum', 'likeNum', 'commentNum']
      arr.forEach(key => {
        article[key] = 0
        article.tasks.forEach(task => {
          article[key] += task[key]
        })
      })
    }
    await Result.success(res, articles)
  };
const getArticle = async (req, res) => {
    const article = await models.Article.findOne({ _id: ObjectId(req.params.id) , user: req.user._id})
    article.tasks = await models.Task.find({ articleId: article._id })
    await Result.success(res, article)
  };
const getArticleTaskList = async (req, res) => {
    const article = await models.Article.findOne({ _id: ObjectId(req.params.id) , user: req.user._id})
    const tasks = await models.Task.find({ articleId: article._id })
    for (let i = 0; i < tasks.length; i++) {
      tasks[i].platform = await models.Platform.findOne({ _id: tasks[i].platformId })
    }
    await Result.success(res, tasks)
  };
const addArticle = async (req, res) => {
    // 创建文章
    let article = new models.Article({
      user: req.user._id,
      title: req.body.title,
      content: req.body.content,
      contentHtml: req.body.contentHtml,
      platformIds: [],
    })
    article = await article.save()
    await Result.success(res, article)
  };
const editArticle = async (req, res) => {
    let article = await models.Article.findOne({ _id: ObjectId(req.params.id) , user: req.user._id})
    if (!article) {
      return Result.error(res, 'not found', 404)
    }
    article.title = req.body.title
    article.content = req.body.content
    article.contentHtml = req.body.contentHtml
    article.updateTs = new Date()
    article = await article.save()
    return await Result.success(res, article)
  };
const deleteArticle = async (req, res) => {
    let article = await models.Article.findOne({ _id: ObjectId(req.params.id) , user: req.user._id})
    if (!article) {
      return Result.notFound(res)
    }
    await models.Article.remove({ _id: ObjectId(req.params.id) , user: req.user._id})
    return await Result.success(res)
  };
const publishArticle = async (req, res) => {
    let article = await models.Article.findOne({ _id: ObjectId(req.params.id) , user: req.user._id})
    if (!article) {
      return Result.error(res, 'not found', 404)
    }
    const tasks = await models.Task.find({
      articleId: article._id,
      status: {
        $in: [
          constants.status.NOT_STARTED,
          constants.status.ERROR,
        ]
      },
      checked: true,
    })
    for (let task of tasks) {
      task.status = constants.status.NOT_STARTED
      task.ready = true
      task.updateTs = new Date()
      await task.save()
    }

    return await Result.success(res)
  };
const addArticleTask = async (req, res) => {
  let article = await models.Article.findOne({ _id: ObjectId(req.params.id) , user: req.user._id})
  if (!article) {
    return Result.error(res, 'not found', 404)
  }

    let task = new models.Task({
      articleId: ObjectId(req.params.id),
      platformId: ObjectId(req.body.platformId),
      status: constants.status.NOT_STARTED,
      category: req.body.category,
      tag: req.body.tag,
    })
    task = await task.save()
    return await Result.success(res, task)
  };

router.get('/', getArticleList)
router.get('/:id', getArticle)
router.get('/:id/tasks', getArticleTaskList)
router.put('/:id/tasks', addArticleTask)
router.put('/', addArticle)
router.post('/:id', editArticle)
router.delete('/:id', deleteArticle)
router.post('/:id/publish', publishArticle)

export = { router, basePath: '/articles', };
