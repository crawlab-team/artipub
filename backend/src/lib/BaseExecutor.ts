import { IPlatform, ITask, Platform } from "@/models";
import logger from "@/logger";
import BaseSpider from "@/spiders/base";

export default class BaseExecutor {
  task: ITask;
  platform: IPlatform;
  spider: BaseSpider;
  constructor(task: ITask) {
    this.task = task;
  }

  async init() {
    const task = this.task;

    // 平台
    this.platform = await Platform.findOne({ _id: task.platformId }) as IPlatform;
    const spiderName = this.platform.name;

    const Spider = await require(`../spiders/${spiderName}`).default;
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
