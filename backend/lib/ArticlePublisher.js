const models = require('../models')
const logger = require('../logger')
const spiders = require('../spiders')
const constants = require('../constants')

class ArticlePublisher {
    constructor(task) {
        this.task = task
    }

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

        // 平台
        const platform = await models.Platform.findOne({ _id: task.platformId })
        const spiderName = platform.name

        let spider
        if (spiderName === constants.platform.JUEJIN) {
            spider = new spiders.JuejinSpider(task._id)
        } else if (spiderName === constants.platform.SEGMENTFAULT) {
            spider = new spiders.SegmentfaultSpider(task._id)
        } else if (spiderName === constants.platform.JIANSHU) {
            spider = new spiders.JianshuSpider(task._id)
        } else if (spiderName === constants.platform.CSDN) {
            spider = new spiders.CsdnSpider(task._id)
        }

        if (spider) {
            try {
                task.status = constants.status.PROCESSING
                task.updateTs = new Date()
                await task.save()
                await spider.run()

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
                await spider.browser.close()
            }
        }
    }
}

module.exports = ArticlePublisher
