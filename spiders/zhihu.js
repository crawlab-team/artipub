const BaseSpider = require('./base')
const constants = require('../constants')

class ZhihuSpider extends BaseSpider {
  async inputContent(article, editorSel) {
    const el = document.querySelector(editorSel.content)
    el.focus()
    document.execCommand('insertText', false, '')
    document.execCommand('insertHTML', false, article.contentHtml)
  }

  async inputFooter(article, editorSel) {
    // do nothing
  }

  async afterInputEditor() {
    // 点击发布文章
    const elPubBtn = await this.page.$('.PublishPanel-triggerButton')
    await elPubBtn.click()
    await this.page.waitFor(5000)

    // 选择标签
    const tags = this.task.tag.split(',')
    for (const tag of tags) {
      const elTagInput = await this.page.$('.PublishPanel-searchInput')
      await elTagInput.type(tag)
      await this.page.waitFor(5000)
      await this.page.evaluate(() => {
        document.querySelector('.PublishPanel-suggest > li:nth-child(1)').click()
      })
    }
    await this.page.waitFor(5000)
  }

  async afterPublish() {
    // this.task.url = await this.page.evaluate(() => {
    //     const el = document.querySelector('a.title')
    //     return 'https://juejin.im' + el.getAttribute('href')
    // })
    // this.task.updateTs = new Date()
    // this.task.status = constants.status.FINISHED
    // await this.task.save()
  }

  async fetchStats() {
  }
}

module.exports = ZhihuSpider
