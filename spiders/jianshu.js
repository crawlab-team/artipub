const constants = require('../constants')
const BaseSpider = require('./base')

class JianshuSpider extends BaseSpider {
  async afterGoToEditor() {
    await this.page.evaluate(() => {
      document.querySelectorAll('span')
        .forEach(el => {
          if (el.textContent.trim() === '新建文章') {
            el.click()
          }
        })
    })
    await this.page.waitFor(5000)
  }

  async afterInputEditor() {
  }

  async afterPublish() {
    this.task.url = this.page.url()
    if (!this.task.url.match(/\/p\/\w+/)) return
    this.task.updateTs = new Date()
    this.task.status = constants.status.FINISHED
    await this.article.save()
  }

  async fetchStats() {
    // TODO: implement this method
  }
}

module.exports = JianshuSpider
