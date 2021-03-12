## ArtiPub 后端模块
从 0.1.6 开始前后端分开打包, 对应前端包 [artipub-frontend](https://www.npmjs.com/package/artipub-frontend)

## 启动命令

```bash
//全局安装
npm i -g artipub-backend --production

//默认启动 http://localhost:3000, 确保本地 mongodb 已经启动在 27017 端口
artipub-be start

//查看其他配置参数
artipub-be start --help

//加 -D 可以后台启动服务，使用的是pm2，配置见 ecosystem.config.js 
artipub-be start -D
pm2 list
```

```bash
//非全局安装
npm i artipub-backend --production

//安装目录下执行, 确保npm 5+, 有npx命令
npx artipub-be start

//或者
./node_modules/.bin/artipub-be start

//查看其他配置参数
npx artipub-be start --help
```
