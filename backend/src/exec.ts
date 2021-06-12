import mongoose = require('mongoose')
const CronJob = require('cron').CronJob
import AsyncLock = require('async-lock');
import constants from './constants'
import logger from './logger'
import { Task } from './models'
import ArticlePublisher from './lib/ArticlePublisher'
import StatsFetcher from './lib/StatsFetcher'

// mongodb连接
mongoose.Promise = global.Promise;
let mongoUrl = '';
if (process.env.MONGO_URL) {
  mongoUrl = process.env.MONGO_URL;
} else if (process.env.MONGO_USERNAME) {
  mongoUrl = `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DB}?authSource=${process.env.MONGO_AUTH_DB}`;
} else {
  mongoUrl = `mongodb://${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DB}`;
}
mongoose.set("useCreateIndex", true); 
mongoose.connect(mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

mongoose.Model.on("index", function (err) {
  if (err) logger.error(err);
});

class Runner {
  constructor() {
  }

  async run() {
    // 任务执行器
    const taskLock = new AsyncLock()
    const taskCronJob = new CronJob('* * * * * *', () => {
      if (!taskLock.isBusy()) {
        taskLock.acquire('key', async () => {
          let task = await Task.findOne({
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

    //定时任务
    const updateStatsCron = '0 0 1 * * *';
   

    // 数据统计执行器
    const statsLock = new AsyncLock()
    const statsCronJob = new CronJob(updateStatsCron, () => {
      if (!statsLock.isBusy()) {
        statsLock.acquire('key', async () => {
          const tasks = await Task.find({
            url: {
              $ne: '',
              $exists: true
            }
          })
          for (let i = 0; i < tasks.length; i++) {
            logger.info('Stats fetch task started')
            let task = tasks[i]
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

export default {
  Runner,
}
