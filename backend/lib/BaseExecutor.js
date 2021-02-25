const spiders = require('../spiders')
const models = require('../models')
const constants = require('../constants')

class BaseExecutor {
  constructor(task) {
    this.task = task
    this.platform = undefined
    this.spider = undefined
  }

  async init() {
    const task = this.task

    // 平台
    this.platform = await models.Platform.findOne({ _id: task.platformId })
    const spiderName = this.platform.name

    const Spider = require(`../spiders/${spiderName}`)
    console.log(Spider)
    this.spider = new Spider(task._id)
  }

  async run() {
    // to be inherited
  }

  async start() {
    await this.init()
    await this.run()
  }
}

module.exports = BaseExecutor
