const ObjectId = require('bson').ObjectId
import constants from '../constants'
import {Router} from 'express'
import * as Result from '../utils/result'
import logger from '../logger'
import BaseSpider from '@/spiders/base'
const router = Router();
import { UserPlatform, Platform, Cookie, Task, Article } from  '@/models';

const getCookieStatus = async (platform: any, userId): Promise<string> => {
  const cookies = await Cookie.find({ domain: { $regex: platform.name } , user: userId })
  if (!cookies || !cookies.length) return constants.cookieStatus.NO_COOKIE
  return constants.cookieStatus.EXISTS
}

const getLoginStatus = async (platform: any, userId): Promise<boolean> => {
  const platformState = await UserPlatform.findOne({ user: userId, platform: platform._id })
  return !!platformState?.loggedIn;
}

const getPlatformList = async (req, res) => {
  const platforms = await Platform.find();
    for (let platform of platforms) {
      platform.loggedIn = await getLoginStatus(platform, req.user._id)
    }
    await Result.success(res, platforms)
  };
const getPlatform = async (req, res) => {
    const platform = await UserPlatform.findOne({ _id: ObjectId(req.params.id) , user: req.user._id })
    platform!.cookieStatus = await getCookieStatus(platform, req.user._id)
    await Result.success(res, platform)
  };
const addPlatform = async (req, res) => {
        let platform = new Platform({
      name: req.body.name,
      label: req.body.label,
      editorType: req.body.editorType,
      description: req.body.description,
      enableImport: req.body.enableImport,
      enableLogin: req.body.enableLogin,
      username: req.body.username,
      password: req.body.password,
    })
    platform = await platform.save()
    await Result.success(res, platform)
  };
const editPlatform = async (req, res) => {
    let platform = await Platform.findOne({ _id: ObjectId(req.params.id) })
    if (!platform) {
      return await Result.notFound(res)
    }
    platform.name = req.body.name
    platform.label = req.body.label
    platform.editorType = req.body.editorType
    platform.description = req.body.description
    platform.enableImport = req.body.enableImport
    platform.enableLogin = req.body.enableLogin
    platform.save()
    await Result.success(res, platform)
  return;
  };
const deletePlatform = async (req, res) => {
    let platform = await Platform.findOne({ _id: ObjectId(req.params.id) })
    if (!platform) {
      return Result.notFound(res)
    }
    await Platform.remove({ _id: ObjectId(req.params.id) })
    return Result.success(res, platform)
  };
const getPlatformArticles = async (req, res) => {
    // 获取平台
    const platform = await Platform.findOne({ _id: ObjectId(req.params.id) })

    // 如果平台不存在，返回404错误
    if (!platform) {
      return Result.notFound(res)
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
      const article = await Article.findOne({ title: siteArticle.title })

      // 网站文章是否存在
      siteArticles[i].exists = !!article

      // 尝试查找网站文章关联的任务
      let task
      if (article) {
        siteArticles[i].articleId = article._id
        task = await Task.findOne({ platformId: platform._id, articleId: article._id })
      }

      // 网站文章是否已关联
      siteArticles[i].associated = !!(task && task.url && task.url === siteArticle.url)
    }

    // 返回结果
    return Result.success(res, siteArticles)
  };
const importPlatformArticles = async (req, res) => {
    // 获取平台
    const platform = await Platform.findOne({ _id: ObjectId(req.params.id) })

    // 如果平台不存在，返回404错误
    if (!platform) {
      return Result.notFound(res)
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
    await Result.success(res)
    return;
  };
const checkPlatformCookieStatus = async (req, res) => {
  const userId = req.user._id;
  const platforms = await Platform.find()
  for (let i = 0; i < platforms.length; i++) {
    const platform = platforms[i]
    const Spider = require(`../spiders/${platform.name}`).default as typeof BaseSpider
    try {
      await Spider.checkCookieStatus(platform, userId)
    } catch (e) {
      logger.error(e)
    }
  }
  await Result.success(res)
  return;
};

router.get('/', getPlatformList)
router.get('/:id', getPlatform)
router.put('/', addPlatform)
router.post('/checkCookies', checkPlatformCookieStatus)
router.post('/:id', editPlatform)
router.delete('/:id', deletePlatform)
router.get('/:id/articles', getPlatformArticles)
router.post('/:id/articles', importPlatformArticles)

export = { router, basePath: '/platforms', };
