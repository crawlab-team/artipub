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
    const iframeWindow = document.querySelector('.cke_wysiwyg_frame').contentWindow
    const el = iframeWindow.document.querySelector(editorSel.content)
    el.focus()
    iframeWindow.document.execCommand('delete', false)
    iframeWindow.document.execCommand('insertHTML', false, article.contentHtml)
  }

  async inputFooter(article, editorSel) {
    const footerContent = `<br><b>本篇文章由一文多发平台<a href="https://github.com/crawlab-team/artipub" target="_blank">ArtiPub</a>自动发布</b>`
    const iframeWindow = document.querySelector('.cke_wysiwyg_frame').contentWindow
    const el = iframeWindow.document.querySelector(editorSel.content)
    el.focus()
    iframeWindow.document.execCommand('insertHTML', false, footerContent)
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
    await this.page.waitFor(5000)

    // 后续处理
    await this.afterPublish()
  }

  async afterPublish() {
    const url = this.page.url()
    if (!url.match(/\/blog\//)) {
      return
    }
    this.task.url = url
    this.task.updateTs = new Date()
    await this.task.save()
  }

  async fetchStats() {
  }
}

module.exports = OschinaSpider
