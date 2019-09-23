const constants = require('../constants')
const BaseSpider = require('./base')

class CsdnSpider extends BaseSpider {
  async afterGoToEditor() {
    await this.page.evaluate(() => {
      const el = document.querySelector('#btnStart')
      if (el) el.click()
    })
    await this.page.waitFor(1000)
  }

  async inputContent(article, editorSel) {
    const footerContent = `<br><b>本篇文章由一文多发平台<a href="https://github.com/crawlab-team/artipub" target="_blank">ArtiPub</a>自动发布</b>`
    const content = article.contentHtml + footerContent;
    const iframeWindow = document.querySelector('.cke_wysiwyg_frame').contentWindow
    const el = iframeWindow.document.querySelector(editorSel.content)
    el.focus()
    iframeWindow.document.execCommand('delete', false)
    iframeWindow.document.execCommand('insertHTML', false, content)
  }

  async inputFooter(article, editorSel) {
    // do nothing
  }

  async afterInputEditor() {
    // 选择文章类型
    await this.page.evaluate(task => {
      const el = document.querySelector('#selType')
      el.value = task.category
    }, this.task)

    // 选择发布形式
    await this.page.evaluate(task => {
      const el = document.querySelector('#' + task.pubType)
      el.click()
    }, this.task)
  }

  async afterPublish() {
    this.task.url = await this.page.evaluate(() => {
      const el = document.querySelector('.toarticle')
      return el.getAttribute('href')
    })
    this.task.updateTs = new Date()
    await this.task.save()
  }

  async fetchStats() {
    if (!this.task.url) return
    await this.page.goto(this.task.url, { timeout: 60000 })
    await this.page.waitFor(5000)

    const stats = await this.page.evaluate(() => {
      const text = document.querySelector('body').innerText
      const mRead = text.match(/阅读数 (\d+)/)
      const readNum = mRead ? Number(mRead[1]) : 0
      const likeNum = Number(document.querySelector('#supportCount').innerText)
      const commentNum = 0 // 暂时获取不了评论数
      return {
        readNum,
        likeNum,
        commentNum
      }
    })
    this.task.readNum = stats.readNum
    this.task.likeNum = stats.likeNum
    this.task.commentNum = stats.commentNum
    await this.task.save()
    await this.page.waitFor(3000)
  }
}

module.exports = CsdnSpider
