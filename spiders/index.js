const ObjectId = require('bson').ObjectId
const mongoose = require('mongoose')
const spiders = require('./spiders')
const constants = require('./constants')
const models = require('./models')
const config = require('./config')

const taskId = process.argv[2]

// mongodb连接
mongoose.Promise = global.Promise
if (config.MONGO_USERNAME) {
    mongoose.connect(`mongodb://${config.MONGO_USERNAME}:${config.MONGO_PASSWORD}@${config.MONGO_HOST}:${config.MONGO_PORT}/${config.MONGO_DB}`, { useNewUrlParser: true })
} else {
    mongoose.connect(`mongodb://${config.MONGO_HOST}:${config.MONGO_PORT}/${config.MONGO_DB}`, { useNewUrlParser: true })
}

const printHelp = () => {
    console.log('please enter correct taskId')
    console.log('node index.js <taskId>')
}

if (!taskId) {
    printHelp()
}

// const main = async () => {
(async () => {
    const taskObjectId = ObjectId(taskId)
    const task = await models.Task.findOne({ _id: taskObjectId })
    await (new Promise(resolve => setTimeout(resolve, 3000)))
    if (!task) {
        console.log(`cannot find task (ID: ${taskId})`)
        return
    }
    const platform = await models.Platform.findOne({ _id: task.platformId })
    const spiderName = platform.name

    let spider
    if (spiderName === constants.platform.JUEJIN) {
        spider = new spiders.JuejinSpider(taskId)
    } else if (spiderName === constants.platform.SEGMENTFAULT) {
        spider = new spiders.SegmentfaultSpider(taskId)
    } else {
        printHelp()
    }
    try {
        await spider.run()
    } catch (e) {
        console.error(e)
        process.exit(1)
    }
})()

// (main)()
