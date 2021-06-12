import BaseSpider from './base';
import constants from '../constants'
import logger from '../logger'
export default class AliyunSpider extends BaseSpider {

  async inputContent(realContent, editorSel) {
    const el = document.querySelector('.textarea') as HTMLInputElement
    el.focus()
    el.select()
    document.execCommand('delete', false)
    document.execCommand('insertText', false, realContent)
  }

  async inputFooter(article, editorSel) {
    // do nothing
  }

  /**
 * 输入编辑器后续操作
 */
  async afterInputEditor() {
    // 填写摘要
    // const title = await this.page.$eval("#title", input => input.value);
    await this.page.evaluate(title => {
      const abs = document.querySelector('#abstractContent') as HTMLInputElement
      abs.focus()
      abs.select()
      document.execCommand('insertText', false, title);
    }, this.article.title)

  }

  async afterPublish() {
    //确认发布
    await this.page.evaluate(() => {
      const els = document.querySelectorAll<HTMLInputElement>('.next-btn-primary')
      els.forEach(el => {
        if (el.innerText.indexOf('确认') != -1) {
          el.click()
        }
      })
    });
    await this.page.waitForNavigation()

    this.task.url = await this.page.evaluate(() => {
      return document.location.href
    })
    logger.info(this.task.url)
    if (!this.task.url) return
    this.task.status = constants.status.FINISHED
    await this.task.save()
  }

  async fetchStats() {
    if (!this.task.url) return
    await this.page.goto(this.task.url, { timeout: 60000 })
    await this.page.waitForNavigation()

    const readNum = await this.page.evaluate(() => {
      const text = document.querySelector('body')!.innerText
      const mRead = text.match(/(\d+)浏览量/)
      const readNum = mRead ? Number(mRead[1]) : 0

      return readNum
    })
    this.task.readNum = readNum
    this.task.likeNum = 0
    this.task.commentNum = 0
    await this.task.save()
    await this.page.waitForTimeout(3000)
  }

  /**
 * 检查Cookie是否能正常登陆
 */
  // async checkCookieStatus() {
  //   // platform
  //   this.platform = await models.Platform.findOne({ _id: ObjectId(this.platformId) });

  //   const cookie = await this.getCookiesForAxios();
  //   let url = "https://developer.aliyun.com/developer/api/my/user/getUser"
  //   axios.get(url, {
  //     headers: {
  //       'Cookie': cookie,
  //     },
  //   })
  //     .then(async res => {
  //       console.log(url);
  //       let text = res.data;
  //       this.platform.loggedIn = res.data.data != null
  //       console.log(this.platform.loggedIn);
  //       await this.platform.save();
  //     });

  // }

}
