import { Platform } from "@/models";
import logger from "../logger";

class BaseExecutor {
  task: any;
  platform: any;
  spider: any;
  constructor(task) {
    this.task = task;
    this.platform = undefined;
    this.spider = undefined;
  }

  async init() {
    const task = this.task;

    // 平台
    this.platform = await Platform.findOne({ _id: task.platformId });;
    const spiderName = this.platform.name;

    const Spider = require(`../spiders/${spiderName}`);
    logger.info(Spider);
    this.spider = new Spider(task._id);
  }

  async run() {
    // to be inherited
  }

  async start() {
    await this.init();
    await this.run();
  }
}

export = BaseExecutor;
