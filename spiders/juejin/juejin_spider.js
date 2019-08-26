const bson = require('bson')
const PCR = require("puppeteer-chromium-resolver")
const credentials = require('../credentials.json').juejin
const Article = require('../models').Article
const utils = require('../utils')
const articleId = process.argv.splice(2)[0]
utils.checkArticleId(articleId, __filename)

const run = async () => {
    // 获取当前文章
    const article = await Article.findOne({ _id: bson.ObjectId(articleId) })
    if (!article) {
        process.exit(1)
    }

    const pcr = await PCR({
        revision: "",
        detectionPath: "",
        folderName: '.chromium-browser-snapshots',
        hosts: ["https://storage.googleapis.com", "https://npm.taobao.org/mirrors"],
        retry: 3,
        silent: false
    })

    // 获取浏览器
    const browser = await (pcr.puppeteer.launch({
        executablePath: pcr.executablePath,
        //设置超时时间
        timeout: 15000,
        //如果是访问https页面 此属性会忽略https错误
        ignoreHTTPSErrors: true,
        // 打开开发者工具, 当此值为true时, headless总为false
        devtools: false,
        // 关闭headless模式, 不会打开浏览器
        headless: false
    }))

    // 新起一个页面
    const page = await browser.newPage()

    // 登陆
    await page.goto('https://juejin.im/login')
    let errNum = 0
    while (errNum < 10) {
        try {
            await page.waitFor(1000)
            const elUsername = await page.$('.input[name="loginPhoneOrEmail"]')
            const elPassword = await page.$('.input[name="loginPassword"]')
            const elSubmit = await page.$('.btn:nth-child(3)')
            await elUsername.type(credentials.username)
            await elPassword.type(credentials.password)
            await elSubmit.click()
            await page.waitFor(3000)
            break
        } catch (e) {
            errNum++
        }
    }

    // 导航至创作文章页面
    await page.goto('https://juejin.im/editor/drafts/new')
    await page.waitFor(3000)

    // 导航至实际写文章
    const elNew = await page.$('.new-button')
    await elNew.click()
    await page.waitFor(3000)

    // 输入内容
    const elTitle = await page.$('.title-input')
    const elContent = await page.$('.ace_text-input')
    await elTitle.type(article.title)
    await elContent.type(article.content)
    await page.waitFor(3000)

    // 关闭浏览器
    await browser.close()

    // 退出程序
    process.exit()
}

(run)()
