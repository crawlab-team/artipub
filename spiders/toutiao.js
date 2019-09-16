const BaseSpider = require('./base')

class OschinaSpider extends BaseSpider {
  async inputContent(article, editorSel) {
    const footerContent = `<br><b>本篇文章由一文多发平台<a href="https://github.com/crawlab-team/artipub" target="_blank">ArtiPub</a>自动发布</b>`
    const content = article.contentHtml + footerContent
    const el = document.querySelector(editorSel.content)
    el.focus()
    document.execCommand('insertHTML', false, content)
  }

  async inputFooter(article, editorSel) {
    // do nothing
  }

  async afterInputEditor() {
  }

  async afterPublish() {
    const url = this.page.url()
    this.task.url = url
    this.task.updateTs = new Date()
    await this.task.save()
  }

  async fetchStats() {
  }
}

module.exports = OschinaSpider
