const constants = require('../constants')
const BaseSpider = require('./base')

class CsdnSpider extends BaseSpider {
    async afterGoToEditor() {
        await this.page.evaluate(() => {
            const el = document.querySelector('#btnStart')
            if (el) el.click()
        })
        await this.page.waitFor(1000)
    }

    async inputContent(article, editorSel) {
        const iframeWindow = document.querySelector('.cke_wysiwyg_frame').contentWindow
        const el = iframeWindow.document.querySelector(editorSel.content)
        el.focus()
        iframeWindow.document.execCommand('delete', false)
        iframeWindow.document.execCommand('insertHTML', false, article.contentHtml)
    }

    async afterInputEditor() {
        // 选择文章类型
        await this.page.evaluate(task => {
            const el = document.querySelector('#selType')
            el.value = task.category
        }, this.task)

        // 选择发布形式
        await this.page.evaluate(task => {
            const el = document.querySelector('#' + task.pubType)
            el.click()
        }, this.task)
    }

    async inputFooter(article, editorSel) {
        const footerContent = `<br><b>本文由文章发布工具<a href="https://github.com/crawlab-team/artipub" target="_blank">ArtiPub</a>自动生成</b>`
        const iframeWindow = document.querySelector('.cke_wysiwyg_frame').contentWindow
        const el = iframeWindow.document.querySelector(editorSel.content)
        el.focus()
        iframeWindow.document.execCommand('insertHTML', false, footerContent)
    }

    async afterPublish() {
        this.task.url = await this.page.evaluate(() => {
            const el = document.querySelector('.toarticle')
            return el.getAttribute('href')
        })
        this.task.updateTs = new Date()
        await this.task.save()
    }
}

module.exports = CsdnSpider
