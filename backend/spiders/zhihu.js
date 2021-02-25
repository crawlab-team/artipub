const fs = require('fs')
const path = require('path')
const BaseSpider = require('./base')
const constants = require('../constants')

class ZhihuSpider extends BaseSpider {
  async afterGoToEditor() {
    // 创建tmp临时文件夹
    const dirPath = path.resolve(path.join(__dirname, '..', 'tmp'))
    if (!fs.existsSync(dirPath)) {
      await fs.mkdirSync(dirPath)
    }

    // 内容
    const content = this.article.content + `\n\n> 本篇文章由一文多发平台[ArtiPub](https://github.com/crawlab-team/artipub)自动发布`

    // 写入临时markdown文件
    const mdPath = path.join(dirPath, `${this.article._id.toString()}.md`)
    await fs.writeFileSync(mdPath, content)

    // 点击更多
    await this.page.click('#Popover3-toggle')
    await this.page.waitFor(1000)

    // 点击导入文档
    await this.page.click('.Editable-toolbarMenuItem:nth-child(1)')
    await this.page.waitFor(1000)

    // 上传markdown文件
    const handle = await this.page.$('input[accept=".docx,.doc,.markdown,.mdown,.mkdn,.md"]')
    await handle.uploadFile(mdPath)
    await this.page.waitFor(5000)

    // 删除临时markdown文件
    await fs.unlinkSync(mdPath)
  }

  async inputContent(article, editorSel) {
    // do nothing
  }

  async inputFooter(article, editorSel) {
    // do nothing
  }

  async afterInputEditor() {
    // 点击发布文章
    await this.page.evaluate(() => {
      const el = document.querySelector('.PublishPanel-triggerButton')
      el.click()
    })
    await this.page.waitFor(5000)

    // 选择标签
    // const tags = this.task.tag.split(',')
    // for (const tag of tags) {
    //   const elTagInput = await this.page.$('.PublishPanel-searchInput')
    //   await elTagInput.type(tag)
    //   await this.page.waitFor(5000)
    //   await this.page.evaluate(() => {
    //     document.querySelector('.PublishPanel-suggest > li:nth-child(1)').click()
    //   })
    // }

    // 点击下一步
    await this.page.evaluate(() => {
      const el = document.querySelector('.PublishPanel-stepOneButton > button')
      el.click()
    })
    await this.page.waitFor(2000)
  }

  async publish() {
    // 发布文章
    try {
      await this.page.evaluate(() => {
        const el = document.querySelector('.PublishPanel-stepTwoButton')
        el.click()
      })
    } catch (e) {
      // do nothing
    }
    await this.page.waitFor(5000)

    // 后续处理
    await this.afterPublish()
  }

  async afterPublish() {
    this.task.url = this.page.url()
    this.task.updateTs = new Date()
    this.task.status = constants.status.FINISHED
    await this.task.save()
  }

  async fetchStats() {
  }
}

module.exports = ZhihuSpider
