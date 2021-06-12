//@ts-nocheck
import request from 'request-promise-native';
const ObjectId = require('bson').ObjectId;
import fs from 'fs';
import cheerio from 'cheerio';
import BaseSpider from './base';
import constants from '../constants';
import models from "@/models";
import config from './config';
import logger from '../logger';
import path from 'path';

export default class WechatSpider extends BaseSpider {
  async init() {
    // 任务
    this.task = await models.Task.findOne({ _id: ObjectId(this.taskId) });
    if (!this.task) {
      throw new Error(`task (ID: ${this.taskId}) cannot be found`);
    }

    // 文章
    this.article = await models.Article.findOne({ _id: this.task.articleId });
    if (!this.article) {
      throw new Error(`article (ID: ${this.task.articleId.toString()}) cannot be found`);
    }

    // 平台
    this.userPlatform = await models.Platform.findOne({ _id: this.task.platformId });
    if (!this.userPlatform) {
      throw new Error(`platform (ID: ${this.task.platformId.toString()}) cannot be found`);
    }

    // 配置
    this.config = config[constants.platform.WECHAT];

    // accessToken
    this.token = undefined;
  }

  async run() {
    // 初始化
    await this.init();

    // 获取Access Token
    await this.getAccessToken();

    // 添加封面图片
    await this.uploadThumbImage();

    // 加入素材
    await this.addMaterial();

    // 获取所有标签
    // await this.getTags();

    // 发送给标签组
    // await this.sendTagGroup();
    logger.info(this.task)
    this.task.updateTs = new Date()
    this.task.url = "https://mp.weixin.qq.com/"
    this.task.status = constants.status.FINISHED
    await this.task.save()

  }

  async afterInputEditor() {
  }

  async fetchStats() {
  }

  async getAccessToken() {
    let token = await models.Token.findOne({ platformName: constants.platform.WECHAT });
    if (!token || token.expiresTs < (new Date())) {
      logger.info('fetching access token');
      // 如果没有token或者token过期了
      const appIdEnv = await models.Environment.findOne({ _id: constants.environment.WECHAT_APP_ID });
      const appSecretEnv = await models.Environment.findOne({ _id: constants.environment.WECHAT_APP_SECRET });
      const response = await request.get(`${this.config.urls.apiEndpoint}/token?grant_type=client_credential&appid=${appIdEnv.value}&secret=${appSecretEnv.value}`);
      const data = JSON.parse(response);
      if (data.access_token) {
        token = new models.Token({
          accessToken: data.access_token,
          expiresTs: new Date(+new Date() + data.expires_in * 1e3),
        });
        await token.save();
      } else {
        logger.error(`[${data.errcode}] ${data.errmsg}`);
        throw new Error('cannot get access_token');
      }
    }
    this.token = token;
  }

  async uploadThumbImage() {
    const pngPath = path.join(__dirname, '../public/favicon.png');
    logger.info(pngPath);
    const data = await request.post(`${this.config.urls.apiEndpoint}/material/add_material?access_token=${this.token.accessToken}&type=image`, {
      formData: {
        media: fs.createReadStream(pngPath),
      },
      json: true,
    });
    logger.info(data);
    this.mediaId = data.media_id;
    this.mediaUrl = data.url;
  }

  async addMaterial() {
    let contentHtml = this.article.contentHtml;
    const $ = cheerio.load(contentHtml);
    $('a')
      .each((i, el) => {
        $(el)
          .after(`<span>${$(el)
            .text()}</span>`);
        $(el)
          .remove();
      });
    contentHtml = $.html();

    // 图片处理
    // let imgSrcList = [];
    // let imgUrls = [];
    // $('img').each((i, el) => {
    //     const src = $(el).getAttribute('src');
    //     imgSrcList.push(src);
    //   });

    const data = await request.post(`${this.config.urls.apiEndpoint}/material/add_news?access_token=${this.token.accessToken}`, {
      body: {
        articles: [{
          title: this.task.title || this.article.title,
          thumb_media_id: this.mediaId,
          digest: $.text()
            .substr(0, 50),
          author: this.task.author || 'Admin',
          show_cover_pic: this.task.showCovPic || 0,
          content: contentHtml,
          content_source_url: '',
          need_open_comment: this.task.needOpenComment || 0,
          only_fans_can_comment: this.task.onlyFansCanComment || 0,
        }],
      },
      json: true,
    });
    this.mediaId = data.media_id;
  }

  async getTags() {
    logger.info(this.token.accessToken)
    await request.get(`${this.config.urls.apiEndpoint}/tags/get?access_token=${this.token.accessToken}`)
      .then((res) => {
        logger.info(res)
        logger.info(res.data.tags[0]['id']);
        this.tagId = res.data.tags[0]['id'];
      });

  }

  async sendTagGroup() {
    const data = await request.post(`${this.config.urls.apiEndpoint}/message/mass/sendall?access_token=${this.token.accessToken}`, {
      filter: {
        is_to_all: false,
        tag_id: this.tagId,
      },
      mpnews: {
        media_id: this.mediaId,
      },
      msgtype: 'mpnews',
      send_ignore_reprint: 0,
    });
    logger.info(data);
    this.mediaId = data.media_id;
    this.mediaUrl = data.url;
  }
}
