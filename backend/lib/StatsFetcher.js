const models = require('../models')
const logger = require('../logger')
const spiders = require('../spiders')

class StatsFetcher {
    constructor(task) {
        this.task = task
    }

    async run() {
    }
}

module.exports = StatsFetcher
