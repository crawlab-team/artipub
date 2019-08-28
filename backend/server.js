const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const logger = require('morgan')
const cors = require('cors')

const config = require('./config')
const routes = require('./routes')

// express实例
const app = express()

// mongodb连接
mongoose.Promise = global.Promise
if (config.MONGO_USERNAME) {
    mongoose.connect(`mongodb://${config.MONGO_USERNAME}:${config.MONGO_PASSWORD}@${config.MONGO_HOST}:${config.MONGO_PORT}/${config.MONGO_DB}`, { useNewUrlParser: true })
} else {
    mongoose.connect(`mongodb://${config.MONGO_HOST}:${config.MONGO_PORT}/${config.MONGO_DB}`, { useNewUrlParser: true })
}

// bodyParser中间件
app.use(bodyParser.json())

// 日志中间件
app.use(logger('dev'))

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
app.get('/articles', routes.article.getArticleList)
app.get('/articles/:id', routes.article.getArticle)
app.put('/articles', routes.article.addArticle)
app.post('/articles/:id', routes.article.editArticle)
app.delete('/articles/:id', routes.article.deleteArticle)
app.post('/articles/:id/publish', routes.article.publishArticle)

app.listen(config.PORT, () => {
    console.log('listening on port ' + config.PORT)
})
