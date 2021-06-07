import BaseSpider from "./base";
import constants from "../constants"

export default class DevTouTiaoSpider extends BaseSpider {
  async inputContent(article, editorSel) {
    // const footerContent = `<br><b>本篇文章由一文多发平台<a href="https://github.com/crawlab-team/artipub" target="_blank">ArtiPub</a>自动发布</b>`;
    const footerContent = "";
    const content = article.content + footerContent;
    const el = document.querySelector(editorSel.content);
    el.CodeMirror.setValue(content);
  }

  async afterInputEditor() {

  }

  async inputFooter(article, editorSel) {
    // do nothing
  }

  getCookieDomainCondition() {
      return { $regex: '.*\.?toutiao\.io'}
  }

  async afterPublish() {
    await this.page.waitForSelector('.user-nav-tabs');

    await Promise.all([
      this.page.click('.user-nav-tabs li:nth-child(2) a'),
      this.page.waitForNavigation()
    ]);

    const articleLink = await this.page.$('.posts .post:nth-child(1) .title a');
    const url = await (await articleLink!.getProperty('href')).jsonValue() as string;

    this.task.url = url;
    this.task.status = constants.status.FINISHED;
    this.task.error = null;
    await this.task.save();
  }
}
