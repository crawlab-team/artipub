const models = require('../models')
const logger = require('../logger')
const constants = require('../constants')
const BaseExecutor = require('./BaseExecutor')

class ArticlePublisher extends BaseExecutor {
  async run() {
    let task = this.task

    // 判断任务状态
    if (
      task.status !== constants.status.NOT_STARTED &&
      task.status !== constants.status.ERROR
    ) {
      logger.info(`task (ID: ${task._id.toString()} has already been run. exit`)
      return
    }

    if (this.spider) {
      try {
        // 更新任务状态
        task.status = constants.status.PROCESSING
        task.updateTs = new Date()
        await task.save()

        // 运行爬虫
        await this.spider.run()

        // 检查URL结果
        task = await models.Task.findOne({ _id: task._id })
        if (task.url) {
          // URL保存成功
          task.status = constants.status.FINISHED
          task.updateTs = new Date()
          await task.save()
        } else {
          // URL保存失败
          task.status = constants.status.ERROR
          task.error = '文章URL未保存成功'
          task.updateTs = new Date()
          await task.save()
        }
      } catch (e) {
        task.status = constants.status.ERROR
        task.error = e.toString()
        task.updateTs = new Date()
        await task.save()
        console.error(e)
        await this.spider.browser.close()
      }
    }
  }
}

module.exports = ArticlePublisher
