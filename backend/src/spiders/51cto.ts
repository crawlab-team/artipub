import BaseSpider from "./base";
import constants from "../constants"

export default class B51CTOSpider extends BaseSpider {
  async inputContent(realContent, editorSel) {
    const el = document.querySelector(editorSel.content);
    el.CodeMirror.setValue(realContent);
  }

  async afterInputEditor() {
    await this.page.evaluate(task => {
      document.querySelector<HTMLInputElement>('#blog_type')!.value = '1';
      //TODO 先写死
      document.querySelector<HTMLInputElement>('#pid')!.value = '31';
      document.querySelector<HTMLInputElement>('#cate_id')!.value = '8';
      document.querySelector<HTMLInputElement>('#tag')!.value = task.tag;
    }, this.task as any);

  }

  async afterPublish() {
    await this.page.waitForTimeout(4000);

    const look = await this.page.$('.look');
    const url = await (await look!.getProperty('href')).jsonValue() as string;

    this.task.url = url;
    this.task.status = constants.status.FINISHED;
    this.task.error = null;
    await this.task.save();
  }
}
