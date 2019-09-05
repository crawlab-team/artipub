const constants = require('../constants')
const BaseSpider = require('./base')

class JianshuSpider extends BaseSpider {
    async afterGoToEditor() {
        await this.page.evaluate(() => {
            document.querySelectorAll('span').forEach(el => {
                if (el.textContent.trim() === '新建文章') {
                    el.click()
                }
            })
        })
        await this.page.waitFor(3000)
    }

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
