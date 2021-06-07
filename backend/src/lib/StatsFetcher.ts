import BaseExecutor from './BaseExecutor'
import logger from '@/logger'

export default class StatsFetcher extends BaseExecutor {
    async run() {
        if (this.spider) {
            try{
              await this.spider.runFetchStats()
            }catch(e){
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
