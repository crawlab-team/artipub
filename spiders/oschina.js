const BaseSpider = require('./base')

class OschinaSpider extends BaseSpider {
  async goToEditor() {
    // 导航至首页
    await this.page.goto('https://oschina.net')
    await this.page.waitFor(5000)

    // 获取编辑器URL
    const url = await this.page.evaluate(() => {
      const aList = document.querySelectorAll('#userSidebar > a.item')
      for (let i = 0; i < aList.length; i++) {
        const a = aList[i]
        if (a.innerHTML.match('写博客')) {
          return a.getAttribute('href')
        }
      }
    })

    if (!url) throw new Error('editor url cannot be empty')

    await this.page.goto(url)
    await this.page.waitFor(5000)
  }

  async inputContent(article, editorSel) {
    const footerContent = `<br><b>本篇文章由一文多发平台<a href="https://github.com/crawlab-team/artipub" target="_blank">ArtiPub</a>自动发布</b>`
    const content = article.contentHtml + footerContent;
    const iframeWindow = document.querySelector('.cke_wysiwyg_frame').contentWindow
    const el = iframeWindow.document.querySelector(editorSel.content)
    el.focus()
    iframeWindow.document.execCommand('delete', false)
    iframeWindow.document.execCommand('insertHTML', false, content)
    document.querySelector('textarea[name="body"]').value = content
  }

  async inputFooter(article, editorSel) {
    // do nothing
  }

  async afterInputEditor() {
    await this.page.click('.inline.fields > .field:nth-child(1) > .dropdown')
    await this.page.waitFor(1000)

    await this.page.evaluate(task => {
      const categories = [
        '移动开发',
        '前端开发',
        '人工智能',
        '服务端开发/管理',
        '游戏开发',
        '编程语言',
        '数据库',
        '企业开发',
        '图像/多媒体',
        '系统运维',
        '软件工程',
        '大数据',
        '云计算',
        '开源硬件',
        '区块链',
        '其他类型',
        '物联网',
      ]
      const index = categories.indexOf(task.category)

      console.log(index)

      const items = document.querySelectorAll('.inline.fields > .field:nth-child(1) > .dropdown .item')
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        if (index === i) {
          item.click()
          return
        }
      }
    }, this.task)
    await this.page.waitFor(3000)
  }

  async publish() {
    // 发布文章
    await this.page.evaluate(editorSel => {
      const el = document.querySelector(editorSel.publish)
      el.click()
    }, this.editorSel)
    await this.page.waitFor(10000)

    // 后续处理
    await this.afterPublish()
  }

  async afterPublish() {
    const url = this.page.url()
    if (!url.match(/\/blog\/\d+/)) {
      return
    }
    this.task.url = url
    this.task.updateTs = new Date()
    await this.task.save()
  }

  async fetchStats() {
    if (!this.task.url) return
    await this.page.goto(this.task.url, { timeout: 60000 })
    await this.page.waitFor(5000)

    const stats = await this.page.evaluate(() => {
      const text = document.querySelector('body').innerText
      const mRead = text.match(/阅读 (\d+)/)
      const mLike = text.match(/点赞 (\d+)/)
      const mComment = text.match(/评论 (\d+)/)
      const readNum = mRead ? Number(mRead[1]) : 0
      const likeNum = mLike ? Number(mLike[1]) : 0
      const commentNum = mComment ? Number(mComment[1]) : 0
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

module.exports = OschinaSpider
