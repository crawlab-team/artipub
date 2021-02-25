const BaseSpider = require("./base");
const constants = require("../constants");
const logger = require("../logger");

class B51CTOSpider extends BaseSpider {
  async inputContent(article, editorSel) {
    // const footerContent = `<br><b>本篇文章由一文多发平台<a href="https://github.com/crawlab-team/artipub" target="_blank">ArtiPub</a>自动发布</b>`;
    const footerContent = "";
    const content = article.content + footerContent;
    const el = document.querySelector(editorSel.content);
    el.CodeMirror.setValue(content);
  }

  async afterInputEditor() {
    await this.page.evaluate(task => {
      document.querySelector('#blog_type').value = 1;
      //TODO 先写死
      document.querySelector('#pid').value = 31;
      document.querySelector('#cate_id').value = 8;
      document.querySelector('#tag').value = task.tag;
    }, this.task);

  }

  async afterPublish() {
    await this.page.waitForTimeout(4000);

    const look = await this.page.$('.look');
    const url = await (await look.getProperty('href')).jsonValue();

    this.task.url = url;
    this.task.updateTs = new Date();
    this.task.status = constants.status.FINISHED;
    this.task.error = null;
    await this.task.save();
  }
}

module.exports = B51CTOSpider;
