const BaseImportSpider = require('./base')

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
                    commentNum: elComment ? Number(elComment.innerText) : 0,
                })
            }
            return _articles
        })
    }

    async importArticle(siteArticle) {
        const id = siteArticle.url.match(/\/(\w+)$/)[1]
        await this.page.goto(`https://juejin.im/editor/posts/${id}`)
        await this.page.waitFor(10000)
    }
}

module.exports = JuejinImportSpider
