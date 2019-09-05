const mongoose = require('mongoose')
const CronJob = require('cron').CronJob
const AsyncLock = require('async-lock')
const constants = require('./constants')
const models = require('./models')
const config = require('./config')
const logger = require('./logger')
const ArticlePublisher = require('./lib/ArticlePublisher')
const StatsFetcher = require('./lib/StatsFetcher')

// mongodb连接
mongoose.Promise = global.Promise
if (config.MONGO_USERNAME) {
    mongoose.connect(`mongodb://${config.MONGO_USERNAME}:${config.MONGO_PASSWORD}@${config.MONGO_HOST}:${config.MONGO_PORT}/${config.MONGO_DB}`, { useNewUrlParser: true })
} else {
    mongoose.connect(`mongodb://${config.MONGO_HOST}:${config.MONGO_PORT}/${config.MONGO_DB}`, { useNewUrlParser: true })
}

(async () => {
    // 任务执行器
    const taskLock = new AsyncLock()
    const taskCronJob = new CronJob('* * * * * *', () => {
        if (!taskLock.isBusy()) {
            taskLock.acquire('key', async () => {
                let task = await models.Task.findOne({
                    status: constants.status.NOT_STARTED,
                    ready: true,
                    checked: true
                })
                if (!task) return

                logger.info('Task started')
                const executor = new ArticlePublisher(task)
                await executor.run()
                logger.info('Task ended')
            })
        }
    })
    taskCronJob.start()

    // 数据统计执行器
    const statsLock = new AsyncLock()
    const statsCronJob = new CronJob('0 0/5 * * * *', () => {
        if (!statsLock.isBusy()) {
            statsLock.acquire('key', async () => {
            })
        }
    })
})()
