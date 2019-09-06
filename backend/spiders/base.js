const PCR = require('puppeteer-chromium-resolver')
const ObjectId = require('bson').ObjectId
const credentials = require('../credentials')
const models = require('../models')
const constants = require('../constants')
const config = require('./config')
const logger = require('../logger')

class BaseSpider {
    constructor(taskId) {
        if (!taskId) {
            throw new Error('taskId must not be empty')
        }

        // 任务ID
        this.taskId = taskId
    }

    async init() {
        // 任务
        this.task = await models.Task.findOne({ _id: ObjectId(this.taskId) })
        if (!this.task) {
            throw new Error(`task (ID: ${this.taskId}) cannot be found`)
        }

        // 文章
        this.article = await models.Article.findOne({ _id: this.task.articleId })
        if (!this.article) {
            throw new Error(`article (ID: ${this.task.articleId.toString()}) cannot be found`)
        }

        // 平台
        this.platform = await models.Platform.findOne({ _id: this.task.platformId })
        if (!this.platform) {
            throw new Error(`platform (ID: ${this.task.platformId.toString()}) cannot be found`)
        }

        // 用户名密码
        this.credential = credentials[this.platform.name]
        if (!this.credential) {
            throw new Error(`credential (platform: ${this.platform.name}) cannot be found`)
        }

        // PCR
        this.pcr = await PCR({
            revision: '',
            detectionPath: '',
            folderName: '.chromium-browser-snapshots',
            hosts: ['https://storage.googleapis.com', 'https://npm.taobao.org/mirrors'],
            retry: 3,
            silent: false
        })

        // 浏览器
        this.browser = await this.pcr.puppeteer.launch({
            executablePath: this.pcr.executablePath,
            //设置超时时间
            timeout: 120000,
            //如果是访问https页面 此属性会忽略https错误
            ignoreHTTPSErrors: true,
            // 打开开发者工具, 当此值为true时, headless总为false
            devtools: false,
            // 关闭headless模式, 不会打开浏览器
            headless: false
        })

        // 页面
        this.page = await this.browser.newPage()

        // 状态
        this.status = {
            loggedIn: false,
            completedEditor: false,
            published: false,
        }

        // 配置
        this.config = config[this.platform.name]
        if (!config) {
            throw new Error(`config (platform: ${this.platform.name}) cannot be found`)
        }

        // URL信息
        this.urls = this.config.urls

        // 登陆选择器
        this.loginSel = this.config.loginSel

        // 编辑器选择器
        this.editorSel = this.config.editorSel


        // 隐藏navigator
        await this.page.evaluate(() => {
            Object.defineProperty(navigator, 'webdriver', {
                get: () => false
            })
        })
    }

    /**
     * 登陆网站
     */
    async login() {
        logger.info(`logging in... navigating to ${this.urls.login}`)
        await this.page.goto(this.urls.login)
        let errNum = 0
        while (errNum < 10) {
            try {
                await this.page.waitFor(1000)
                const elUsername = await this.page.$(this.loginSel.username)
                const elPassword = await this.page.$(this.loginSel.password)
                const elSubmit = await this.page.$(this.loginSel.submit)
                await elUsername.type(this.credential.username)
                await elPassword.type(this.credential.password)
                await elSubmit.click()
                await this.page.waitFor(3000)
                break
            } catch (e) {
                errNum++
            }
        }

        // 查看是否登陆成功
        this.status.loggedIn = errNum !== 10

        if (this.status.loggedIn) {
            logger.info('Logged in')
        }
    }

    /**
     * 设置Cookie
     */
    async setCookies() {
        const cookies = await models.Cookie.find({ domain: { $regex: this.platform.name } })
        for (let i = 0; i < cookies.length; i++) {
            const c = cookies[i]
            await this.page.setCookie({
                name: c.name,
                value: c.value,
                domain: c.domain,
            })
        }
    }

    /**
     * 导航至写作页面
     */
    async goToEditor() {
        logger.info(`navigating to ${this.urls.editor}`)
        await this.page.goto(this.urls.editor)
        await this.page.waitFor(5000)
        await this.afterGoToEditor()
    }

    async afterGoToEditor() {
        // 导航至写作页面的后续处理
        // 掘金等网站会先弹出Markdown页面，需要特殊处理
    }

    async inputTitle(article, editorSel) {
        const el = document.querySelector(editorSel.title)
        el.focus()
        el.select()
        document.execCommand('delete', false)
        document.execCommand('insertText', false, article.title)
    }

    async inputContent(article, editorSel) {
        const el = document.querySelector(editorSel.content)
        el.focus()
        el.select()
        document.execCommand('delete', false)
        document.execCommand('insertText', false, article.content)
    }

    async inputFooter(article, editorSel) {
        const footerContent = `\n\n> 本文由文章发布工具[ArtiPub](https://github.com/crawlab-team/artipub)自动生成`
        const el = document.querySelector(editorSel.content)
        el.focus()
        document.execCommand('insertText', false, footerContent)
    }

    async inputEditor() {
        logger.info(`input editor title and content`)
        // 输入标题
        await this.page.evaluate(this.inputTitle, this.article, this.editorSel)
        await this.page.waitFor(3000)

        // 输入内容
        await this.page.evaluate(this.inputContent, this.article, this.editorSel)
        await this.page.waitFor(3000)

        // 输入脚注
        await this.page.evaluate(this.inputFooter, this.article, this.editorSel)
        await this.page.waitFor(3000)

        // 后续处理
        await this.afterInputEditor()
    }

    async afterInputEditor() {
        // 输入编辑器内容的后续处理
        // 标签、分类输入放在这里
    }

    async publish() {
        logger.info(`publishing article`)
        // 发布文章
        const elPub = await this.page.$(this.editorSel.publish)
        await elPub.click()
        await this.page.waitFor(10000)

        // 后续处理
        await this.afterPublish()
    }

    async afterPublish() {
        // 提交文章的后续处理
        // 保存文章url等逻辑放在这里
    }

    async run() {
        // 初始化
        await this.init()

        if (this.task.authType === constants.authType.LOGIN) {
            // 登陆
            await this.login()
        } else {
            // 使用Cookie
            await this.setCookies()
        }

        // 导航至编辑器
        await this.goToEditor()

        // 输入编辑器内容
        await this.inputEditor()

        // 发布文章
        await this.publish()

        // 关闭浏览器
        await this.browser.close()
    }

    async fetchStats() {
        // to be inherited
    }

    async runFetchStats() {
        // 初始化
        await this.init()

        // 获取文章数据
        await this.fetchStats()

        // 关闭浏览器
        await this.browser.close()
    }
}

module.exports = BaseSpider
