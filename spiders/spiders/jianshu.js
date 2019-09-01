const constants = require('../constants')
const BaseSpider = require('./base')

class JianshuSpider extends BaseSpider {
    async afterInputEditor() {
    }

    async afterPublish() {
        // this.task.url = this.page.url()
        this.task.updateTs = new Date()
        this.task.status = constants.status.FINISHED
        await this.article.save()
    }
}

module.exports = JianshuSpider
