const BaseSpider = require('./base')
const constants = require('../constants')

class JuejinSpider extends BaseSpider {
    async afterGoToEditor() {
        await this.page.goto(this.urls.editor)
        await this.page.waitFor(5000)
    }

    async afterInputEditor() {
        // 点击发布文章
        const elPubBtn = await this.page.$('.publish-popup')
        await elPubBtn.click()
        await this.page.waitFor(5000)

        // 选择类别
        await this.page.evaluate((task) => {
            document.querySelectorAll('.category-list > .item').forEach(el => {
                if (el.textContent === task.category) {
                    el.click()
                }
            })
        }, this.task)
        await this.page.waitFor(5000)

        // 选择标签
        const elTagInput = await this.page.$('.tag-input > input')
        await elTagInput.type(this.task.tag)
        await this.page.waitFor(5000)
        await this.page.evaluate(() => {
            document.querySelector('.suggested-tag-list > .tag:nth-child(1)').click()
        })
        await this.page.waitFor(5000)
    }

    async afterPublish() {
        this.task.url = await this.page.evaluate(() => {
            const el = document.querySelector('a.title')
            return 'https://juejin.im' + el.getAttribute('href')
        })
        this.task.updateTs = new Date()
        this.task.status = constants.status.FINISHED
        await this.task.save()
    }

    async fetchStats() {
        if (!this.task.url) return
        await this.page.goto(this.task.url, { timeout: 60000 })
        await this.page.waitFor(5000)

        const stats = await this.page.evaluate(() => {
            const text = document.querySelector('body').innerText
            const mRead = text.match(/阅读 (\d+)/)
            const readNum = mRead ? Number(mRead[1]) : 0
            const likeNum = Number(document.querySelector('.like-btn').getAttribute('badge'))
            const commentNum = Number(document.querySelector('.comment-btn').getAttribute('badge'))
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

module.exports = JuejinSpider
