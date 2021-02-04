const BaseSpider = require("./base");
const constants = require("../constants");
const logger = require("../logger");

class BaiJiaHaoSpider extends BaseSpider {
  async inputContent(article, editorSel) {
    // const footerContent = `<br><b>本篇文章由一文多发平台<a href="https://github.com/crawlab-team/artipub" target="_blank">ArtiPub</a>自动发布</b>`;
    const footerContent = "";
    const content = article.contentHtml + footerContent;
    const ue = UE.getEditor(editorSel.content);
    ue.setContent(content);
  }

  async afterInputEditor() {
    // 选择分类
    await this.page.click(".ant-select-arrow");
    await this.page.waitFor(50);
    //"互联网"分类
    await this.page.click(".ant-select-dropdown-menu > li:nth-child(6)");
    await this.page.waitFor(50);

    //选择封面 单图
    await this.page.click(".cover-radio-group input[value=one]");
    await this.page.waitFor(500);
    await this.page.click(".client_pages_edit_cover_uploaderView  .container");

    await this.page.waitFor(1000);
    //选择第一张封面图
    await this.page.click(
      ".client_components_imageModal_chooseCover > .item:nth-child(2)"
    );
    await this.page.waitFor(2000);
    //点击确定按钮
    await this.page.click(".ant-modal-footer  button:nth-child(2)");
  }

  async login() {
    await this.page.goto(this.urls.login);
    await this.page.waitFor(3000);

    let errNum = 0;
    let loginSuccess = false;

    const elSubmit = await this.page.$(this.loginSel.submit);
    while (errNum < 10 && !loginSuccess) {
      try {

        await this.page.evaluate(
          (loginSel, platform) => {
            document.querySelector(loginSel.username).value = platform.username;
            document.querySelector(loginSel.password).value = platform.password;
            document.querySelector(loginSel.submit).disabled = false;
            document.querySelector(loginSel.submit).click();
          },
          this.loginSel,
          this.platform
        );


        // const elUsername = await this.page.$(this.loginSel.username);
        // const elPassword = await this.page.$(this.loginSel.password);
        // await elUsername.type(this.platform.username);
        // await elPassword.type(this.platform.password);
        // await elSubmit.click();

        await this.page.waitFor(5000);

        //判断是否登陆成功重定向到个人主页
        const url = await this.page.url();
        if (url === 'https://baijiahao.baidu.com/') {
          loginSuccess = true;
          break;
        }

        //出现弹框需要验证
        const codeClose = await this.page.$('.vcode-close');
        if (codeClose) {
          const boundingBox = await codeClose.boundingBox();

          //移动鼠标去关闭验证弹框
          await this.page.mouse.move(boundingBox.x, boundingBox.y, {
            steps: 20
          });
          await this.page.mouse.down();
          await this.page.waitFor(500);
          // await elSubmit.click();
        }

        await this.page.evaluate(
          (loginSel, platform) => {
            document.querySelector(loginSel.submit).disabled = false;
            document.querySelector(loginSel.submit).click();
          },
          this.loginSel,
          this.platform
        );

        // await this.page.waitFor(1000);
        // const elSubmit1 = await this.page.$(this.loginSel.submit);

        // await elSubmit1.click();
        await this.page.waitFor(5000);
        const newUrl = await this.page.url();
        if (newUrl === 'https://baijiahao.baidu.com/') {
          loginSuccess = true;
          break;
        }

        errNum++;
      } catch (e) {
        logger.info("errNum: " + errNum++);
        logger.error(e);
      }
    }


    if (loginSuccess) {
      logger.info("Logged in success");
    } else {
      throw new Error('登录百家号失败');
    }
  }

  async inputFooter(article, editorSel) {
    // do nothing
  }

  async afterPublish() {
    await this.page.goto(
      "https://baijiahao.baidu.com/builder/rc/content?type=&collection=&pageSize=1&currentPage=1"
    );
    await this.page.waitFor(2000);
    const article = await this.page.$(".client_pages_content a:nth-child(1)");
    const url = await (await article.getProperty("href")).jsonValue();

    this.task.url = url;
    this.task.updateTs = new Date();
    this.task.status = constants.status.FINISHED;
    this.task.error = null;
    await this.task.save();
  }
}

module.exports = BaiJiaHaoSpider;
