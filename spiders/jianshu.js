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
    this.task.url = await this.page.evaluate(() => {
      const aList = document.querySelectorAll('a');
      for (let i = 0; i < aList.length; i++) {
        const a = aList[i]
        const href = a.getAttribute('href')
        if (href && href.match(/\/p\/\w+/)) {
          return href
        }
      }
    })
    if (!this.task.url) return
    this.task.updateTs = new Date()
    this.task.status = constants.status.FINISHED
    await this.task.save()
  }

  async fetchStats() {
    // TODO: implement this method
  }
}

module.exports = JianshuSpider
