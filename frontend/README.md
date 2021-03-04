## ArtiPub 前端模块
从 0.1.6 开始前后端分开打包, 对应后端包 [artipub-backend](https://www.npmjs.com/package/artipub-backend)

## 启动命令

```bash
//全局安装
npm i -g artipub-frontend --production

//默认启动 http://localhost:8000
artipub-fe start

//查看其他配置参数
artipub-fe start --help
```

```bash
//非全局安装
npm i artipub-frontend --production

//安装目录下执行, 确保npm 5+, 有npx命令
npx artipub-fe start

//或者
./node_modules/.bin/artipub-fe start

//查看其他配置参数
npx artipub-fe start --help
```
