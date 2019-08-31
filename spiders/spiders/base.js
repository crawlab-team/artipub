const PCR = require('puppeteer-chromium-resolver')
const ObjectId = require('bson').ObjectId
const log4js = require('log4js')
const credentials = require('../credentials')
const models = require('../models')
const constants = require('../constants')
const config = require('./config')

// 日志配置
const logger = log4js.getLogger()
logger.level = 'debug'

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
            timeout: 15000,
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
     * 导航至写作页面
     */
    async goToEditor() {
        logger.info(`navigating to ${this.urls.editor}`)
        await this.page.goto(this.urls.editor)
        await this.page.waitFor(3000)
        await this.afterGoToEditor()
    }

    async afterGoToEditor() {
        // 导航至写作页面的后续处理
        // 掘金等网站会先弹出Markdown页面，需要特殊处理
    }

    async inputEditor() {
        logger.info(`input editor title and content`)
        // 输入标题
        const elTitle = await this.page.$(this.editorSel.title)
        await elTitle.type(this.article.title)
        await this.page.waitFor(3000)

        // 输入内容
        await this.page.evaluate((article, editorSel) => {
            const el = document.querySelector(editorSel.content)
            el.focus()
            document.execCommand('insertText', false, article.content)
        }, this.article, this.editorSel)
        await this.page.waitFor(1000)

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
        await this.page.waitFor(5000)

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

        // 判断任务状态
        if (
            this.task.status !== constants.status.NOT_STARTED &&
            this.task.status !== constants.status.ERROR
        ) {
            logger.info(`task (ID: ${this.task._id.toString()} has already been run. exit`)
            return
        }

        // 登陆
        await this.login()

        // 导航至编辑器
        await this.goToEditor()

        // 输入编辑器内容
        await this.inputEditor()

        // 发布文章
        // await this.publish()

        // 关闭浏览器
        await this.browser.close()
    }
}

module.exports = BaseSpider
