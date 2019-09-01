const BaseSpider = require('./base')
const constants = require('../constants')

class SegmentfaultSpider extends BaseSpider {
    async afterInputEditor() {
        const tags = this.task.tag.split(',')
        const elTagInput = await this.page.$('.sf-typeHelper-input')
        for (const tag of tags) {
            await elTagInput.type(tag)
            await this.page.waitFor(1000)
            await this.page.evaluate(() => {
                const el = document.querySelector('.sf-typeHelper-list > li:nth-child(1)')
                if (el) {
                    el.click()
                }
            })
            await this.page.waitFor(1000)
        }
        await this.page.waitFor(3000)
    }

    async afterPublish() {
        this.task.url = this.page.url()
        this.task.updateTs = new Date()
        this.task.status = constants.status.FINISHED
        if (this.task.url.includes('https://segmentfault.com/a/')) {
            await this.task.save()
        }
    }
}

module.exports = SegmentfaultSpider
