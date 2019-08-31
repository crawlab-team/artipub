const BaseSpider = require('./base')
const constants = require('../constants')

class JuejinSpider extends BaseSpider {
    async afterGoToEditor() {
        await this.page.goto(this.urls.editor)
        await this.page.waitFor(3000)
    }

    async afterInputEditor() {
        // 点击发布文章
        const elPubBtn = await this.page.$('.publish-popup')
        await elPubBtn.click()
        await this.page.waitFor(3000)

        // 选择类别
        await this.page.evaluate((task) => {
            document.querySelectorAll('.category-list > .item').forEach(tag => {
                if (tag.textContent === task.tag) {
                    tag.click()
                }
            })
        }, this.task)
        await this.page.waitFor(1000)

        // 选择标签
        const elTagInput = await this.page.$('.tag-input > input')
        await elTagInput.type(this.task.tag)
        await this.page.waitFor(3000)
        await this.page.evaluate(() => {
            document.querySelector('.suggested-tag-list > .tag:nth-child(1)').click()
        })
        await this.page.waitFor(3000)
    }

    async afterPublish() {
        const arr = this.page.url().split('/')
        const id = arr[arr.length - 1]
        this.task.url = `https://juejin.im/post/${id}`
        this.task.updateTs = new Date()
        this.task.status = constants.status.FINISHED
        await this.task.save()
    }
}

module.exports = JuejinSpider
