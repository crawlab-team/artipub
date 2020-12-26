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
                await this.spider.browser.close()
              }
            }
        }
    }
}

module.exports = StatsFetcher
