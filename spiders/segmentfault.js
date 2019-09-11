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

    async fetchStats() {
        if (!this.task.url) return
        await this.page.goto(this.task.url, { timeout: 60000 })
        await this.page.waitFor(5000)

        const stats = await this.page.evaluate(() => {
            const text = document.querySelector('body').innerText
            const mRead = text.match(/(\d+) 次阅读/)
            const mComment = text.match(/(\d+) 条评论/)
            const readNum = mRead ? Number(mRead[1]) : 0
            const likeNum = Number(document.querySelector('#side-widget-votes-num').innerText)
            const commentNum = mComment ? Number(mComment[1]) : 0
            return {
                readNum,
                likeNum,
                commentNum
            }
        })
        this.task.readNum = stats.readNum
        this.task.likeNum = stats.likeNum
        this.task.commentNum = stats.commentNum
        await this.task.save()
        await this.page.waitFor(3000)
    }
}

module.exports = SegmentfaultSpider
