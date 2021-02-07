const models = require('../models')
const logger = require('../logger')
const spiders = require('../spiders')
const constants = require('../constants')
const BaseExecutor = require('./BaseExecutor')

class StatsFetcher extends BaseExecutor {
    async run() {
        if (this.spider) {
            try{
              await this.spider.runFetchStats()
            }catch(e){
              console.error(e)
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

module.exports = StatsFetcher
