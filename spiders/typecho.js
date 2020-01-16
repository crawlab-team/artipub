const BaseSpider = require('./base')
const constants = require('../constants')
const configs = require('./config')
const datas = require('../data')
const Typechoblog = require('typecho-api')
const models = require('../models')

// eslint-disable-next-line max-len


class TypechoSpider extends BaseSpider {

  async login() {
    const platform = await models.Platform.findOne({name:'typecho'})
    if(!platform){
      logger.info('没有这个平台')
    }
    if(!platform.url||!platform.username||!platform.password){
      logger.info('请完善平台信息')
    }
    const metaWeblog = new Typechoblog(platform.url, platform.username, platform.password);
    metaWeblog.getUsersBlogs('1').then(function (res) {
      if (res.length > 0) {
        // 查看是否登陆成功
        this.status.loggedIn = true;
      } else {
        this.status.loggedIn = false;
        // eslint-disable-next-line no-undef
        logger.info('登录失败，检查网络或者密码');
      }
    })

    if (this.status.loggedIn) {
      // eslint-disable-next-line no-undef
      logger.info('Logged in')
    }
  }

  // eslint-disable-next-line class-methods-use-this,no-empty-function
  async goToEditor() {
  }

  // eslint-disable-next-line class-methods-use-this,no-empty-function
  async inputEditor() {
  }

  async publish() {
    let content = ""
    let that = this
    datas.platforms.forEach(ele => {
      if (ele.name === constants.platform.TYPECHO) {
        if (ele.editorType === constants.editorType.MARKDOWN) {
          content = that.article.content
        } else {
          content = that.article.contentHtml
        }
      }
    })

    const arti = {
      title: this.article.title,
      description: content,
      mt_keywords: that.task.tag || "tag",
      categories: [that.task.category],
    }
    let postid, postLink = ""
    const platform = await models.Platform.findOne({name:'typecho'})
    const metaWeblog = new Typechoblog(platform.url, platform.username, platform.password);

    await metaWeblog.newPost("1", arti, true).then(function (post_id) {
      console.log(post_id)
      postid = post_id
    }).then(function (err) {
      console.log(err)
      return err
    })
    await metaWeblog.getPost(postid).then(function (res) {
      postLink = res.link
    }).then(function (err) {
      console.log(err)
    })
    if (!postLink) return
    this.task.url = postLink
    this.task.updateTs = new Date()
    this.task.status = constants.status.FINISHED
    await this.task.save()

  }

  async fetchStats() {
  }
}

module.exports = TypechoSpider
