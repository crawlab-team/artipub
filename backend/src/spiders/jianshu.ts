import constants from '../constants'
import BaseSpider from './base'

export default class JianshuSpider extends BaseSpider {
  /**
   * 输入编辑器
   */
  async inputEditor() {
    // 输入标题
    await this.page.evaluate(this.inputTitle, this.article as any, this.editorSel, this.task as any)
    await this.page.waitForTimeout(3000)

    // 按tab键切换
    await this.page.keyboard.press('Tab')
    await this.page.waitForTimeout(1000)

    // 输入内容
    await this.page.evaluate(this.inputContent, this.article as any, this.editorSel)
    await this.page.waitForTimeout(3000)

    // 输入脚注
    await this.page.evaluate(this.inputFooter, this.article as any, this.editorSel)

    // 敲入空值防止内容为空
    const elContent = await this.page.$(this.editorSel.content);
    await elContent!.type(' ')
    await this.page.waitForTimeout(3000)

    // 后续处理
    await this.afterInputEditor()
  }

  /**
   * 输入文章内容
   */
  async inputContent(article, editorSel) {
    const footerContent = `\n\n> 本篇文章由一文多发平台[ArtiPub](https://github.com/crawlab-team/artipub)自动发布`
    const content = article.content + footerContent
    document.execCommand('insertText', false, content)
  }

  async inputFooter(article, editorSel) {
    // do nothing
  }

  async afterGoToEditor() {
    await this.page.evaluate(() => {
      document.querySelectorAll('span')
        .forEach(el => {
          if (el.textContent!.trim() === '新建文章') {
            el.click()
          }
        })
    })
    await this.page.waitForTimeout(5000)
  }

  async afterInputEditor() {
  }

  async afterPublish() {
    const noteId = this.page.url().split('/')[7];
    //等待发布请求结束
    await this.page.waitForResponse(`https://www.jianshu.com/author/notes/${noteId}/publicize`);

    this.task.url = await this.page.evaluate(() => {
      const aList = document.querySelectorAll('a');
      for (let i = 0; i < aList.length; i++) {
        const a = aList[i]
        const href = a.getAttribute('href')
        if (href && href.match(/\/p\/\w+/)) {
          return href
        }
      }
      return;
    }) as string;
    if (!this.task.url) return
    this.task.status = constants.status.FINISHED
    await this.task.save()
  }

  async fetchStats() {
    // TODO: implement this method
  }
}
