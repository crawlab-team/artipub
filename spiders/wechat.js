const BaseSpider = require('./base')
const constants = require('../constants')

class WechatSpider extends BaseSpider {
  async afterInputEditor() {
  }

  async publish() {
    // 发布文章
    // const elPub = await this.page.$(this.editorSel.publish)
    // await elPub.click()
    // await this.page.waitFor(20000)

    // 后续处理
    await this.afterPublish()
  }

  async afterPublish() {
    // this.task.url = await this.page.url().replace('#reply0', '')
    // if (!this.task.url.match(/\/t\/\d+/)) return
    // this.task.updateTs = new Date()
    // this.task.status = constants.status.FINISHED
    // await this.task.save()
  }

  async fetchStats() {
  }
}

module.exports = WechatSpider
