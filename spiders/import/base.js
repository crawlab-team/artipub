const PCR = require('puppeteer-chromium-resolver')
const showdown = require('showdown')
const models = require('../../models')
const BaseSpider = require('../base')
const globalConfig = require('../../config')
const config = require('../config')
const logger = require('../../logger')

showdown.setOption('tables', true)
showdown.setOption('tasklists', true)
showdown.setFlavor('github')

class BaseImportSpider extends BaseSpider {
  constructor(platformName) {
    super(BaseSpider)
    if (!platformName) {
      throw new Error('platformId must not be empty')
    }
    this.platformName = platformName
  }

  async init() {
    // 平台
    this.platform = await models.Platform.findOne({ name: this.platformName })

    // PCR
    this.pcr = await PCR({
      revision: '',
      detectionPath: '',
      folderName: '.chromium-browser-snapshots',
      hosts: ['https://storage.googleapis.com', 'https://npm.taobao.org/mirrors'],
      retry: 3,
      silent: false
    })

    // 是否开启chrome浏览器调试
    const enableChromeDebugEnv = await models.Environment.findOne({_id: constants.environment.ENABLE_CHROME_DEBUG})
    const enableChromeDebug = enableChromeDebugEnv.value

    // 浏览器
    this.browser = await this.pcr.puppeteer.launch({
      executablePath: this.pcr.executablePath,
      timeout: 60000,
      //如果是访问https页面 此属性会忽略https错误
      ignoreHTTPSErrors: true,
      devtools: false,
      headless: enableChromeDebug !== 'Y',
      args: [
        '--no-sandbox',
      ]
    })

    // 页面
    this.page = await this.browser.newPage()

    // 设置 浏览器视窗
    await this.page.setViewport({
      width: 1300,
      height: 938
    })

    // 配置
    this.config = config[this.platform.name]
    if (!config) {
      throw new Error(`config (platform: ${this.platform.name}) cannot be found`)
    }

    // 编辑器选择器
    this.editorSel = this.config.editorSel

    // showdown配置
    showdown.setOption('tables', true)
    showdown.setOption('tasklists', true)
    showdown.setFlavor('github')

    // markdown to html转换器
    this.converter = new showdown.Converter()
  }

  async fetchArticles() {
    // to be overridden
  }

  async fetch() {
    logger.info('fetching articles')

    await this.init()
    await this.setCookies()
    try {
      await this.page.goto(this.platform.url, { timeout: 60000 })
    } catch (e) {
      console.error(e)
      await this.browser.close()
      return []
    }
    await this.page.waitFor(5000)
    const articles = await this.fetchArticles()
    await this.browser.close()
    return articles
  }

  async importArticle(siteArticle) {
    // to be overridden
  }

  async import(siteArticles) {
    logger.info('importing articles')

    await this.init()
    await this.setCookies()
    for (let i = 0; i < siteArticles.length; i++) {
      const siteArticle = siteArticles[i]
      if (siteArticle.exists && siteArticle.associated) continue
      await this.importArticle(siteArticle)
    }

    await this.browser.close()

    logger.info('imported articles')
  }
}

module.exports = BaseImportSpider
