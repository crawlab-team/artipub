## ArtiPub 前端模块
从 0.1.6 开始前后端分开打包, 对应后端包 [artipub-backend](https://www.npmjs.com/package/artipub-backend)

## 启动命令

```bash
//全局安装
npm i -g artipub-frontend --production

//默认启动 http://localhost:8000 ,前台运行，命令终端关闭，则服务也关闭。
artipub-fe start

//查看其他配置参数
artipub-fe start --help

//如果不部署在本地，可以通过 -h 参数指定后端服务地址(默认请求 http://127.0.0.1:3000), -D 将用pm2 作为静态服务器,在后台运行。
artipub-fe start -h http://192.168.1.1:3000 -D

// 加 -D 之后就可以使用pm2的一系列命令来管理服务, 除 list 外，其他命令后面可以跟 服务id,来操作相应服务
pm2 list //查看服务状态
pm2 logs //查看日志
pm2 restart //重启服务
pm2 delete //删除服务
pm2 stop //停止服务
```

static-page-server-8000  为前端服务  
id 0/1 为集群模式启动的两个后端服务

┌─────┬────────────────────────────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┬──────────┬──────────┬──────────┬──────────┐
│ id  │ name                       │ namespace   │ version │ mode    │ pid      │ uptime │ ↺    │ status    │ cpu      │ mem      │ user     │ watching │
├─────┼────────────────────────────┼─────────────┼─────────┼─────────┼──────────┼────────┼──────┼───────────┼──────────┼──────────┼──────────┼──────────┤
│ 0   │ server                     │ default     │ 0.2.1   │ cluster │ 158073   │ 2D     │ 0    │ online    │ 0%       │ 68.8mb   │ root     │ disabled │
│ 1   │ server                     │ default     │ 0.2.1   │ cluster │ 158080   │ 2D     │ 0    │ online    │ 0%       │ 69.2mb   │ root     │ disabled │
│ 3   │ static-page-server-8000    │ default     │ 4.5.5   │ fork    │ 956375   │ 43m    │ 0    │ online    │ 0%       │ 44.5mb   │ root     │ disabled │
└─────┴────────────────────────────┴─────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┴──────────┴──────────┴──────────┴──────────┘

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
