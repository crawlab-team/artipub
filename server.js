const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const morgan = require('morgan')

const init = require('./init')
const config = require('./config')
const routes = require('./routes')
const exec = require('./exec')
const logger = require('./logger')

// express实例
const app = express()

// 环境变量覆盖
console.log(process.env)
if (process.env.MONGO_HOST) config.MONGO_HOST = process.env.MONGO_HOST
if (process.env.MONGO_PORT) config.MONGO_PORT = process.env.MONGO_PORT
if (process.env.MONGO_DB) config.MONGO_DB = process.env.MONGO_DB
if (process.env.MONGO_USERNAME) config.MONGO_USERNAME = process.env.MONGO_USERNAME
if (process.env.MONGO_PASSWORD) config.MONGO_PASSWORD = process.env.MONGO_PASSWORD
if (process.env.MONGO_AUTH_DB) config.MONGO_AUTH_DB = process.env.MONGO_AUTH_DB

// mongodb连接
mongoose.Promise = global.Promise
if (config.MONGO_USERNAME) {
  mongoose.connect(`mongodb://${config.MONGO_USERNAME}:${config.MONGO_PASSWORD}@${config.MONGO_HOST}:${config.MONGO_PORT}/${config.MONGO_DB}?authenticationDatabase=${config.MONGO_AUTH_DB}`, { useNewUrlParser: true })
} else {
  mongoose.connect(`mongodb://${config.MONGO_HOST}:${config.MONGO_PORT}/${config.MONGO_DB}`, { useNewUrlParser: true })
}

// bodyParser中间件
app.use(bodyParser.json())

// 日志中间件
app.use(morgan('dev'))

// 跨域cors
app.use('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', req.headers.origin)
  res.header('Access-Control-Allow-Credentials', true)
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
