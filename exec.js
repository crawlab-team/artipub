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

class Runner {
  constructor() {
  }

  async run() {
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

          logger.info('Publish task started')
          const executor = new ArticlePublisher(task)
          await executor.start()
          logger.info('Publish task ended')
        })
      }
    })
    taskCronJob.start()

    // 获取环境变量
    let errNum = 0
    let updateStatsCron
    while (errNum < 10) {
      updateStatsCron = await models.Environment.findOne({ _id: constants.environment.UPDATE_STATS_CRON })
      if (!updateStatsCron) {
        await setTimeout(() => {}, 5000);
      } else {
        break;
      }
    }

    // 数据统计执行器
    const statsLock = new AsyncLock()
    const statsCronJob = new CronJob(updateStatsCron.value, () => {
      if (!statsLock.isBusy()) {
        statsLock.acquire('key', async () => {
          const tasks = await models.Task.find({
            url: {
              $ne: '',
              $exists: true
            }
          })
          for (let i = 0; i < tasks.length; i++) {
            logger.info('Stats fetch task started')
            let task = await tasks[i]
            const executor = new StatsFetcher(task)
            await executor.start()
            logger.info('Stats fetch task ended')
          }
        })
      }
    })
    statsCronJob.start()
  }
}

module.exports = {
  Runner,
}
