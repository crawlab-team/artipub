const ObjectId = require('bson').ObjectId
const os = require('os')
const clipboardy = require('clipboardy')
const BaseImportSpider = require('./base')
const models = require('../../models')
const constants = require('../../constants')
const logger = require('../../logger')

class JuejinImportSpider extends BaseImportSpider {
    async fetchArticles() {
        const userPath = await this.page.evaluate(() => {
            const items = document.querySelectorAll('.nav-menu-item')
            for (let i = 0; i < items.length; i++) {
                const item = items[i]
                const span = item.querySelector('span')
                if (span && span.innerText === '我的主页') {
                    return item.querySelector('a').getAttribute('href')
                }
            }
        })
        await this.page.goto('https://juejin.im' + userPath + '/posts', { waitUntil: 'networkidle2' })
        await this.page.waitFor(3000)

        return await this.page.evaluate(() => {
            const _articles = []
            const items = document.querySelectorAll('.entry-list > .item')
            for (let i = 0; i < items.length; i++) {
                const item = items[i]
                const elRead = item.querySelector('.view-count')
                const elLike = item.querySelector('.likedCount')
                const elComment = item.querySelector('.comment > .count')
                _articles.push({
                    url: 'https://juejin.im' + item.querySelector('a.title').getAttribute('href'),
                    title: item.querySelector('a.title').innerText,
                    readNum: elRead ? Number(elRead.innerText.replace('阅读 ', '')) : 0,
                    likeNum: elLike ? Number(elLike.innerText) : 0,
                    commentNum: elComment ? Number(elComment.innerText) : 0
                })
            }
            return _articles
        })
    }

    async importArticle(siteArticle) {
        logger.info(`importing ${siteArticle.url}`)

        // 获取文章ID
        const id = siteArticle.url.match(/\/(\w+)$/)[1]

        // 导航至文章编辑页面
        await this.page.goto(`https://juejin.im/editor/posts/${ id }`)
        await this.page.waitFor(5000)

        // 点击文章选择框
        await this.page.click(this.editorSel.content)

        // 根据操作系统决定操作键
        const ctrlKey = os.platform() === 'darwin' ? 'Meta' : 'Control'

        // 全选文章内容
        await this.page.keyboard.down(ctrlKey)
        await this.page.keyboard.press('KeyA')
        await this.page.keyboard.up(ctrlKey)
        await this.page.waitFor(500)

        // 拷贝文章内容
        await this.page.keyboard.down(ctrlKey)
        await this.page.keyboard.press('KeyC')
        await this.page.keyboard.up(ctrlKey)
        await this.page.waitFor(500)
        await this.page.screenshot({path: 'C:\\Users\\marvzhang\\artipub\\backend\\screenshot1.png'})

        // 读取剪切板内容
        const content = clipboardy.readSync()

        if (siteArticle.exists) {
            // 保存文章
            const article = await models.Article.findOne({ _id: ObjectId(siteArticle.articleId) })
            article.content = content
            article.contentHtml = this.converter.makeHtml(content)
            article.updateTs = new Date()
            await article.save()

            // 保存任务
            const task = await models.Task.findOne({ platformId: this.platform._id, articleId: article._id })
            task.url = siteArticle.url
            task.status = constants.status.FINISHED
            task.updateTs = new Date()
            await task.save()
        } else {
            // 保存文章
            let article = new models.Article({
                title: siteArticle.title,
                content: content,
                contentHtml: this.converter.makeHtml(content),
                createTs: new Date(),
                updateTs: new Date()
            })
            article = await article.save()

            // 保存任务
            let task = new models.Task({
                platformId: this.platform._id,
                articleId: article._id,
                url: siteArticle.url,
                status: constants.status.FINISHED,
                checked: true,
                createTs: new Date(),
                updateTs: new Date(),
                authType: constants.authType.COOKIES,
                readNum: siteArticle.readNum,
                likeNum: siteArticle.likeNum,
                commentNum: siteArticle.commentNum
            })
            await task.save()
        }
    }
}

module.exports = JuejinImportSpider
