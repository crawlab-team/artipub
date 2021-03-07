import express = require ( 'express')
import mongoose = require ( 'mongoose')
import bodyParser = require ( 'body-parser')
import morgan = require ( 'morgan')

import init from './init'
import config from './config'
import routes from './routes'
import exec from './exec'
import logger from './logger'

// express实例
const app = express()

// 环境变量
logger.info(process.env)

// mongodb连接
mongoose.Promise = global.Promise
if (config.MONGO_USERNAME) {
  const mongoUrl = `mongodb://${config.MONGO_USERNAME}:${config.MONGO_PASSWORD}@${config.MONGO_HOST}:${config.MONGO_PORT}/${config.MONGO_DB}?authSource=${config.MONGO_AUTH_DB}`
  mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true }
  );
} else {
  mongoose.connect(
    `mongodb://${config.MONGO_HOST}:${config.MONGO_PORT}/${config.MONGO_DB}`,
    { useNewUrlParser: true, useUnifiedTopology: true }
  );
}

// bodyParser中间件
app.use(bodyParser.json({
  limit: '5mb'
}))
app.use(bodyParser.urlencoded({
  limit: '5mb',
  extended: true //需明确设置
}))

// 日志中间件
app.use(morgan('dev'))

// 跨域cors
app.use('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', req.headers.origin)
  res.header('Access-Control-Allow-Credentials', "true")
  res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With')
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS')//设置方法
  if (req.method === 'OPTIONS') {
    res.send(200) // 意思是，在正常的请求之前，会发送一个验证，是否可以请求。
  } else {
    next()
  }
})

// 路由
// 文章
app.get('/articles', routes.article.getArticleList)
app.get('/articles/:id', routes.article.getArticle)
app.get('/articles/:id/tasks', routes.article.getArticleTaskList)
app.put('/articles/:id/tasks', routes.article.addArticleTask)
app.put('/articles', routes.article.addArticle)
app.post('/articles/:id', routes.article.editArticle)
app.delete('/articles/:id', routes.article.deleteArticle)
app.post('/articles/:id/publish', routes.article.publishArticle)
// 任务
app.get('/tasks', routes.task.getTaskList)
app.get('/tasks/:id', routes.task.getTask)
app.put('/tasks', routes.task.addTask)
app.put('/tasks/batch', routes.task.addTasks)
app.post('/tasks/:id', routes.task.editTask)
app.delete('/tasks/:id', routes.task.deleteTask)
// 平台
app.get('/platforms', routes.platform.getPlatformList)
app.get('/platforms/:id', routes.platform.getPlatform)
app.put('/platforms', routes.platform.addPlatform)
app.post('/platforms/checkCookies', routes.platform.checkPlatformCookieStatus)
app.post('/platforms/:id', routes.platform.editPlatform)
app.delete('/platforms/:id', routes.platform.deletePlatform)
app.get('/platforms/:id/articles', routes.platform.getPlatformArticles)
app.post('/platforms/:id/articles', routes.platform.importPlatformArticles)
// Cookie
app.post('/cookies', routes.cookie.addCookies)
// Environment
app.get('/environments', routes.environment.getEnvList)
app.post('/environments', routes.environment.editEnv)

// 启动express server
app.listen(config.PORT, () => {
  logger.info('listening on port ' + config.PORT)
})

// 初始化
init()

// 启动执行器
const runner = new exec.Runner()
runner.run()
