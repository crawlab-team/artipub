//@ts-nocheck
import BaseSpider from './base'
import constants from '../constants'
import logger from '../logger'

export default class JuejinSpider extends BaseSpider {

  async inputContent(article, editorSel) {
    const footerContent = `\n\n> 本篇文章由一文多发平台[ArtiPub](https://github.com/crawlab-team/artipub)自动发布`
    const content = article.content + footerContent
    const el = document.querySelector('.CodeMirror')
    //@ts-ignore
    el.CodeMirror.setValue(content)
  }

  async inputFooter(article, editorSel) {
    // do nothing
  }


  async afterInputEditor() {
    // 点击发布文章
    await this.page.click('.publish-popup');
    await this.page.waitForSelector('.publish-popup .panel', {
      visible: true
    });

    // 选择类别
    await this.page.evaluate((task) => {
      document.querySelectorAll('.category-list > .item').forEach((el: Element) => {
        if (el.textContent.trim() === task.category) {
          //@ts-ignore
          el.click()
        }
      })
    }, this.task)

    // 选择标签
    await this.page.click(
      ".tag-input > .byte-select > .byte-select__wrap > .byte-select__content-wrap > .byte-select__placeholder"
    );

    logger.info(this.task.tag)
    await this.page.keyboard.type(this.task.tag, { delay: 100 }); // Types slower, like a user

    await this.page.waitForSelector(
      "body > .byte-select-dropdown > .byte-select-dropdown__wrap > .byte-select-option--hover"
    );
    await this.page.click(
      "body > .byte-select-dropdown > .byte-select-dropdown__wrap > .byte-select-option--hover"
    );
    //要等会才能点按钮, 选择完标签后，发布按钮会变成disabled,然后又马上变回可以点击
    await this.page.waitForTimeout(1000)
  }

  async afterPublish() {
    this.task.url = await this.page.evaluate(() => {
      const el = document.querySelector('a.title')
      return 'https://juejin.cn' + el.getAttribute('href')
    })
    this.task.updatedAt = new Date()
    this.task.error = null;
    this.task.status = constants.status.FINISHED
    await this.task.save()
  }

  async fetchStats() {
    if (!this.task.url) return
    await this.page.goto(this.task.url, { timeout: 60000 })
    await this.page.waitForTimeout(5000)

    const stats = await this.page.evaluate(() => {
      const text = document.querySelector('body').innerText
      const mRead = text.match(/阅读 (\d+)/)
      const readNum = mRead ? Number(mRead[1]) : 0
      const likeNum = Number(document.querySelector('.like-btn').getAttribute('badge'))
      const commentNum = Number(document.querySelector('.comment-btn').getAttribute('badge'))
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
    await this.page.waitForTimeout(3000)
  }
}
