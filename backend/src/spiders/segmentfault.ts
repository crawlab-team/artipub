import BaseSpider from './base'
import constants from '../constants'

export default class SegmentfaultSpider extends BaseSpider {
  async inputContent(article, editorSel) {
    //关掉提示 “你的专栏文章正在审核中，请耐心等待"
    let warnWindow = document.querySelector(".btn-secondary") as HTMLButtonElement;
    if(warnWindow) {
       warnWindow.click();
    }
    // const footerContent = `<br><b>本篇文章由一文多发平台<a href="https://github.com/crawlab-team/artipub" target="_blank">ArtiPub</a>自动发布</b>`;
    const footerContent = "";
    const content = article.content + footerContent;
    const el = document.querySelector(editorSel.content);
    el.setValue(content);

  }

  async inputFooter(article, editorSel) {
    // do nothing
  }

  async afterInputEditor() {
    // 点击添加标签
    await this.page.click(".tag-wrap");
    await this.page.waitForTimeout(3000);

    // 输入并选择标签
    const tags = this.task.tag!.split(",");
    const elTagInput = await this.page.$("#searchTag");
    for (const tag of tags) {
      // 清除已有内容
      await this.page.evaluate(() => {
        const el = document.querySelector("#searchTag") as HTMLInputElement;
        el.select();
        document.execCommand("delete", false);
      });
      await this.page.waitForTimeout(1000);

      // 输入标签
      await elTagInput!.type(tag);
      await this.page.waitForTimeout(3000);
      await this.page.evaluate(() => {
        const el = document.querySelector("#tagSearchResult > a:nth-child(1)");
        if (el) {
          //@ts-ignore
          el.click();
        }
      });
      await this.page.waitForTimeout(3000);
    }


  }

  async publish() {
    // 发布文章
    //触发"发布文章"按钮的下拉列表
    await this.page.click(".show ,.dropdown");
    await this.page.waitForTimeout(1000);
    // 点击"确认发布"
    await this.page.click("#sureSubmitBtn");
    await this.page.waitForTimeout(10000);

    // 后续处理
    await this.afterPublish();
  }

  async afterPublish() {
    this.task.url = this.page.url();
    this.task.status = constants.status.FINISHED;
    if (this.task.url.includes("https://segmentfault.com/a/")) {
      await this.task.save();
    }
  }

  async fetchStats() {
    if (!this.task.url) return;
    await this.page.goto(this.task.url, { timeout: 60000 });
    await this.page.waitForTimeout(5000);

    const stats = await this.page.evaluate(() => {
      const text = document.querySelector("body")!.innerText;
      const mRead = text.match(/(\d+) 次阅读/);
      const mComment = text.match(/(\d+) 条评论/);
      const readNum = mRead ? Number(mRead[1]) : 0;
      const likeNum = Number(
        //@ts-ignore
        document.querySelector("#side-widget-votes-num").innerText
      );
      const commentNum = mComment ? Number(mComment[1]) : 0;
      return {
        readNum,
        likeNum,
        commentNum
      };
    });
    this.task.readNum = stats.readNum;
    this.task.likeNum = stats.likeNum;
    this.task.commentNum = stats.commentNum;
    await this.task.save();
    await this.page.waitForTimeout(3000);
  }
}
