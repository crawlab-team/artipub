import BaseSpider from './base'
import logger from '../logger'

export default class ToutiaoSpider extends BaseSpider {
  async inputContent(article, editorSel) {
    const footerContent = `<br><b>本篇文章由一文多发平台ArtiPub自动发布</b>. https://github.com/crawlab-team/artipub`
    const content = article.contentHtml + footerContent
    const el = document.querySelector(editorSel.content)
    el.focus()
    document.execCommand('insertHTML', false, content)
  }

  async afterGoToEditor() {
    await this.page.waitForSelector(this.editorSel.title);

    //关闭模态提醒框
    const modalTip = await this.page.evaluate(() => {
      let title = document.querySelector<HTMLInputElement>('.byte-modal-title')?.innerText;
      let text = document.querySelector<HTMLInputElement>('.byte-modal-content')?.innerText;
      document.querySelector<HTMLButtonElement>('.byte-modal-close-icon')?.click();
      return { title, text };
    });

    if (modalTip.title) {
      logger.warn(modalTip.text);
      await this.page.waitForTimeout(100);
    }

    await this.page.waitForSelector(this.editorSel.content, {
      visible: true
    });

  }

  async inputFooter(article, editorSel) {
    // do nothing
  }

  async publish() {
    // 发布文章
    const elPub = await this.page.$(this.editorSel.publish)
    await elPub!.click()
    await this.page.waitForTimeout(10000)

    const naviUrl = await this.page.url();

    //发布成功跳到列表页
    if (naviUrl != 'https://mp.toutiao.com/profile_v4/graphic/articles') {
      throw new Error('头条发布失败，可能因为图片、外链等原因，有头模式启动dubug');
    }

    // 后续处理
    await this.afterPublish()
  }

  async afterInputEditor() {
    //部分分辨率会展开右侧发文助手，影响点击
    await this.page.evaluate(() => {
      document.querySelector<HTMLElement>('.byte-drawer-close-icon')?.click();
    });
    await this.page.waitForTimeout(1000);

    //处理图片，要点击下
    const editLinks = await this.page.$$('.editor-image-menu > .image-menu-event-prevent:nth-child(2) > a');

    for (let element of editLinks) {
      await element.click();

      await this.page.waitForTimeout(1000);
      await this.page.click('.btns button:nth-child(2)');
      await this.page.waitForTimeout(1000);
    };
  }

  async afterPublish() {
    const id = await this.page.evaluate(() => {
      //选择第一个
      const url = document.querySelector('.article-card-bone  a.title')!.getAttribute('href');
      return url!.match(/pgc_id=(\d+)$/)![1]
    });
    this.task.url = `https://www.toutiao.com/item/${id}`;
    this.task.error = null;
    await this.task.save()
  }

  async fetchStats() {
  }
}
