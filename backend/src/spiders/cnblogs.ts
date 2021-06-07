import BaseSpider from './base'
import constants from '../constants'
import logger from '../logger'

export default class CnblogsSpider extends BaseSpider {

  // async inputContent(article, editorSel) {
  //   const footerContent = `<br><b>本篇文章由一文多发平台<a href="https://github.com/crawlab-team/artipub" target="_blank">ArtiPub</a>自动发布</b>`
  //   const content = article.contentHtml + footerContent;
  //   const iframeWindow = document.querySelector('#Editor_Edit_EditorBody_ifr').contentWindow
  //   const el = iframeWindow.document.querySelector(editorSel.content)
  //   el.focus()
  //   iframeWindow.document.execCommand('delete', false)
  //   iframeWindow.document.execCommand('insertHTML', false, content)
  // }

  async afterGoToEditor() {
    const isMarkdownEditor = await this.page.evaluate(() => {
      return document.querySelector<HTMLInputElement>('#editor-switcher')!.innerText.includes('markdown');
    });

    //切换到markdown编辑器
    if (!isMarkdownEditor) {
      await this.page.click('#editor-switcher');
      await this.page.click('#dropdown-menu > button:nth-child(2)');
    }

    //推荐到首页候选区,需要满足字数
    // await this.page.click('#site-publish-candidate');

  }

  async afterInputEditor() {
    //点击预览，触发编辑器事件，不然保存时取不到文本域的值
    await this.page.click('.tab-bar li:nth-child(2)');
  }

  async afterPublish() {
    this.task.url = await this.page.evaluate(() => {
      return document.querySelector('.link-post-title')!.getAttribute('href')?.substring(2);
    }) as string;
    logger.info(this.task.url)
    if (!this.task.url) return
    this.task.status = constants.status.FINISHED
    await this.task.save()
  }

  async fetchStats() {
    if (!this.task.url) return
    await this.page.goto(this.task.url, { timeout: 60000 })
    await this.page.waitForTimeout(5000)

    const stats = await this.page.evaluate(() => {
      const text = document.querySelector('body')!.innerText
      const mRead = text.match(/阅读 \((\d+)\)/)
      const mLike = document.querySelector<HTMLInputElement>('#bury_count')!.innerText
      const mComment = text.match(/评论 \((\d+)\)/)
      const readNum = mRead ? Number(mRead[1]) : 0
      const likeNum = Number(mLike)
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
    await this.page.waitForTimeout(3000)
  }
}
