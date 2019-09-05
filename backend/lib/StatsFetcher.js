const models = require('../models')
const logger = require('../logger')
const spiders = require('../spiders')
const constants = require('../constants')
const BaseExecutor = require('./BaseExecutor')

class StatsFetcher extends BaseExecutor {
    async run() {
        if (this.spider) {
            await this.spider.fetchStats()
        }
    }
}

module.exports = StatsFetcher
