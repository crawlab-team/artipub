const puppeteer = require('puppeteer');

(async () => {
    const browser = await (puppeteer.launch({
        // 若是手动下载的chromium需要指定chromium地址, 默认引用地址为 /项目目录/node_modules/puppeteer/.local-chromium/
        // executablePath: '/Users/huqiyang/Documents/project/z/chromium/Chromium.app/Contents/MacOS/Chromium',
        //设置超时时间
        timeout: 15000,
        //如果是访问https页面 此属性会忽略https错误
        ignoreHTTPSErrors: true,
        // 打开开发者工具, 当此值为true时, headless总为false
        devtools: false,
        // 关闭headless模式, 不会打开浏览器
        headless: false
    }))

    // 验证信息
    const credentials = {
    }

    // 新起一个页面
    const page = await browser.newPage()

    // 登陆
    await page.goto('https://segmentfault.com/user/login')
    let errNum = 0
    while (errNum < 10) {
        try {
            await page.waitFor(1000)
            const elUsername = await page.$('input[name="username"]')
            const elPassword = await page.$('input[name="password"]')
            const elSubmit = await page.$('button[type="submit"]')
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
    await page.goto('https://segmentfault.com/write')
    await page.waitFor(3000)

    // 输入内容
    const elTitle = await page.$('#myTitle')
    await elTitle.type('it works')
    await page.waitFor(3000)

    browser.close()
})()

