import logger from '../logger'
import constants from '../constants'
import BaseExecutor from './BaseExecutor'
import { ITask, Task } from '@/models'

export default class ArticlePublisher extends BaseExecutor {
  async run() {
    let task = this.task

    // 判断任务状态
    if (
      task.status !== constants.status.NOT_STARTED &&
      task.status !== constants.status.ERROR
    ) {
      logger.info(`task (ID: ${task._id.toString()} has already been run. exit`)
      return
    }

    if (this.spider) {
      try {
        // 更新任务状态
        task.status = constants.status.PROCESSING
        await task.save()

        // 运行爬虫
        await this.spider.run()

        // 检查URL结果
        task = await Task.findOne({ _id: task._id }) as ITask;
        if (task.url) {
          // URL保存成功
          task.status = constants.status.FINISHED
          await task.save()
        } else {
          // URL保存失败
          task.status = constants.status.ERROR
          task.error = '文章URL未保存成功'
          await task.save()
        }
      } catch (e) {
        task.status = constants.status.ERROR
        task.error = e.toString()
        await task.save()
        logger.error(e)
      }finally{
        if(this.spider.browser){
          const pages = await this.spider.browser.pages();
          await Promise.all(pages.map(page => page.close()));
          await this.spider.browser.close();
        }
      }
    }
  }
}
