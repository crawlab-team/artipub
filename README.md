![ArtiPub 内容创作者的搬运工,一处书写，随处可见](https://s3.ax1x.com/2021/02/19/yfhxKg.png)

![](https://img.shields.io/github/release/crawlab-team/artipub)
![](https://img.shields.io/github/last-commit/crawlab-team/artipub)
![](https://img.shields.io/github/issues/crawlab-team/artipub)
![](https://img.shields.io/docker/pulls/tikazyq/artipub?logo=docker)
![](https://img.shields.io/npm/dw/artipub?logo=npm)
![](https://img.shields.io/github/license/crawlab-team/artipub)

ArtiPub (Article Publisher 的简称，意为 "文章发布者") 是一款开源的一文多发平台，可以帮助文章作者将编写好的文章自动发布到掘金、SegmentFault、CSDN、知乎、开源中国等技术媒体平台，传播优质知识，获取最大的曝光度。ArtiPub 安装简单，提供了多种安装方式，可以一键安装使用，安装一般只要 5 分钟。

ArtiPub 目前支持文章编辑、文章发布、数据统计的功能，后期我们会加入存量文章导入、数据分析的功能，让您更好的管理、优化您的技术文章。此外，我们还会接入更多媒体渠道，真正做到让文章随处可阅。

> ⚠️⚠️⚠️ **增加登录注册功能之后，mongodb表结构发生较大变化，前后不兼容，建议重命名mongodb库名以做备份，后端应用启动后会重新初始化 `artipub` 库，再迁移原来文章至新表**

## Demo 地址
http://121.41.169.182:8000/

浏览器插件配置后端地址: http://121.41.169.182:3000

> ⚠️⚠️⚠️ **目前使用的是免费MongoDB服务，只有512M空间，会不定期删除内容，请自行做好文章备份。**

由于各个平台会不定期更新文章发布页面，所以部分平台可能会失效，没有那么及时更新支持。请勿发布垃圾文章，否则账号可能会被对应平台封禁。
## 支持平台

- [x] [掘金](https://juejin.cn)
- [x] [SegmentFault](https://segmentfault.com)
- [x] [CSDN](https://csdn.net)
- [x] [简书](https://jianshu.com)
- [x] [知乎](https://zhihu.com)
- [x] [开源中国](https://oschina.net)
- [x] [今日头条](https://toutiao.com)
- [x] [博客园](https://cnblogs.com)
- [ ] [微博](https://weibo.com)
- [x] [百度百家号](https://baijiahao.baidu.com)
- [x] [51CTO](https://blog.51cto.com)
- [x] [开发者头条](https://toutiao.io)
- [x] 微信公众号

### git clone 备用地址
如若github clone网络过慢，可使用如下同步更新的国内仓库。
- https://gitee.com/tanliyuan/artipub.git
- ![CODING](https://via.placeholder.com/13/f03c15/000000?text=+)[<span><strong>腾讯CODING</strong></span>](http://t.hk.uy/rtg): https://e.coding.net/tanliyuan/artipub/Artipub.git
  
## 预览截图

#### 登录注册

![](https://z3.ax1x.com/2021/03/31/cA31BT.md.png)

#### 平台管理

![平台管理](http://cdn.pic.mtianyan.cn/blog_img/20200930050955.png)

#### 文章管理

![](https://raw.githubusercontent.com/tikazyq/my-static-files/master/artipub/screenshots/artipub-article.png)

#### 文章编辑

![](https://raw.githubusercontent.com/tikazyq/my-static-files/master/artipub/screenshots/artipub-article-edit.png)

#### 文章发布

![](http://cdn.pic.mtianyan.cn/blog_img/20200930051030.png)

#### Chrome 插件

![](https://raw.githubusercontent.com/tikazyq/my-static-files/master/artipub/screenshots/artipub-extension.png)

## 安装要求

#### Docker 安装

- Docker: 18.03
- Docker Compose: 1.24.1

#### NPM 或源码安装

- MongoDB: 3.6+
- NodeJS: 10+
- NPM: > 5+ , < 7+

## 安装方式

ArtiPub 提供 3 种安装方式如下。

- [Docker](# 通过 Docker 安装) (大约 5 分钟): 适合对 Docker 有一定基础的开发者
- [npm](# 通过 npm 包安装) (大约 3 分钟): 适合熟悉 Node.js 或 npm 的开发者
- [源码](# 通过源码安装) (大约 5-10 分钟): 适合希望了解内核原理的开发者

### 通过 Docker 安装

通过 Docker，可以免去安装 MongoDB 的步骤，也是我们最推荐的安装方式。使用 Docker 安装 ArtiPub 前，请确保您安装了 Docker 以及 Docker Compose。docker运行 ArtiPub 有两种方式。

- 通过 docker-compose.yaml 启动
  
适用于你本地之前没有运行 `mongodb` 容器。 在您的项目目录下创建 `docker-compose.yaml` 文件，输入如下内容。

```yaml
version: "3.3"
services:
  app:
    image: "tanliyuan123/artipub:1.2.0"
    environment:
      MONGO_HOST: "mongo"
      # MONGO_USERNAME: root
      # MONGO_PASSWORD: example
      ARTIPUB_API_ADDRESS: "http://localhost:3000" # 后端API地址，如果安装地址不在本机，请修改为协议+服务器IP地址+端口号（默认为3000）
    ports:
      - "8000:8000" # frontend
      - "3000:3000" # backend
    depends_on:
      - mongo
  mongo:
    image: mongo:latest
    restart: always
    #volumes:
    #  - "E:\\mongodb:/data/db"
    ports:
      - "27017:27017"
```

然后在命令行中输入如下命令。如果你想再次启动容器时上次内容不会被销毁，去掉 `volumes` 两行的注释，改成自己本地路径即可。

```bash
docker-compose up
```

然后在浏览器中输入 `http://localhost:8000` 可以看到界面。

注意⚠️，如果您的 Docker 宿主机不是本机，例如您用了 Docker Machine 或者 Docker 服务在其他机器上，您需要将环境变量 `ARTIPUB_API_ADDRESS` 改为宿主机 IP + 端口号（默认 3000）。然后，在浏览器输入 `http://< 宿主机 IP>:8000` 即可看到界面。

  - 独立启动 artipub 镜像
  
  如果你本地已有启动的mongodb容器，不想用上面方式再起一个。其中 `goofy_ganguly` 为本地已启动的 mongodb 容器名, 替换成你本地的即可。

  ```bash
  docker run --rm -it --link goofy_ganguly  -p 3000:3000/tcp  -p 8000:8000/tcp  tanliyuan123/artipub:1.2.0
  ```

### 通过 npm 包安装

如果您对 npm 熟悉，且已经有 MongoDB 的环境，这是最为快捷的方式。

从0.1.6版本开始前后端分开打包.

**安装 artipub-front 前端包**

[artipub-front](frontend/README.md)

**安装 artipub-backend 后端包**

[artipub-backend](backend/README.md)

安装 npm 包时，为了加速下载速度，可以加入 `--registry` 参数来设置镜像源（后面源码安装时也可以这样操作）

```bash
npm install -g artipub-frontend --registry=https://registry.npm.taobao.org
```


成功运行后，在浏览器中输入 `http://localhost:8000` 可以看到界面。

### 通过源码安装

**克隆 Github Repo**

```bash
git clone https://github.com/crawlab-team/artipub
```

**安装 npm 包**

```bash
cd artipub/frontend
npm install

cd artipub/backend
npm install
```

**启动前端**

```bash
//frontend 目录下
npm run dev
```

**启动后端**

```bash
//backend 目录下
npm run dev



//运行prod 需先全局安装pm2
npm i pm2 -g
npm run prod
```

**配置数据库**

数据库的配置在 `backend/src/config.ts` 中，可以按情况配置。

**配置后端 API 地址**

如果您部署的服务不在本机，需要在 `frontend/src/constants.ts` 中将 `apiEndpoint` 改成对应的 IP 地址 + 端口。

## 原理

利用了爬虫技术将文章发布到各大平台。ArtiPub 的爬虫是用了 Google 开发的自动化测试工具 Puppeteer，这个工具不仅可以获取需要有 ajax 动态内容的数据，还可以来做一些模拟操作，类似于 Selenium，但更强大。如何进行登陆操作呢？其实 ArtiPub 是通过 Chrome 插件获取了用户登陆信息（Cookie），将 Cookie 注入到 Puppeteer 操作的 Chromium 浏览器中，然后浏览器就可以正常登陆网站进行发文操作了。Cookie 是保存在用户自己搭建的 MongoDB 数据库里，不对外暴露，因此很安全。

下图是 ArtiPub 的架构示意图：

![img](https://deppwang.oss-cn-beijing.aliyuncs.com/blog/2020-04-11-112006.png)

架构原理简介如下：

- 后端（Backend）是整个架构的中枢，负责给前端交换数据、储存读取数据库、控制爬虫、收集 Cookie 等；
- Chrome 插件（Chrome Extension）只负责从网站（Sites）获取 Cookie；
- 爬虫（Spiders）被后端控制，负责在网站上发布文章和抓取数据；
- 数据库（MongoDB）负责储存数据；
- 前端（Frontend）是一个 React 应用，是 Ant Design Pro 改造而来的。

## 为什么创建 ArtiPub

程序员和技术人员常常会写技术文章和博客，用作技术分享、产品分享或提供咨询等等。技术博主通常需要在多个媒体渠道发布文章，例如掘金、SegmentFault、CSDN、知乎、简书、微信公众号等等，以求最大的关注度。但是，发布文章到这么多平台费时费神，需要不断地复制粘贴；同时，作者想查看阅读数时还需要来回切换各个网站来进行统计。这非常不方便。ArtiPub 主要就是为了来解决上述这些问题的。

市面上已经存在一文多发平台了，例如 OpenWrite，为何还要创建 ArtiPub 呢？或许其他一文多发平台也是一个替代方案，但它们要求用户将自己的账户信息例如 Cookie 或账号密码上传到对方服务器，这很不安全，一旦平台发生问题，自己的账户信息会遭到泄漏。虽然我相信一般平台不会恶意操作用户的账户，但如果出现误操作，您的账户隐私将遭到泄漏，平台上的财产也可能遭到损坏，有这样的风险需要考虑。ArtiPub 不要求用户上传账户信息，所有账户信息全部保存在用户自己的数据库里，因此规避了这个安全风险。

另外，由于 ArtiPub 是开源的，JS 源码也比较易于理解，可扩展性很强，用户如果有其他平台的接入需求，完全可以更改源码来实现自己的需求，不用等待平台更新。开发组也将持续开发 ArtiPub，将其打造得更实用和易用。


## 贡献代码

非常欢迎优秀的开发者来贡献 ArtiPub。在提 Pull Request 之前，请首先阅读源码，了解原理和架构。如果不懂的可以加作者微信 tikazyq1 注明 ArtiPub。

## 社区

如果您觉得 ArtiPub 对您有帮助，请扫描下方群二维码，如果群满，请加作者微信 tikazyq1 并注明 "ArtiPub"，作者会将你拉入群。

<p align="center">
    <img src="https://raw.githubusercontent.com/tikazyq/my-static-files/master/artipub/wechat-group.jpg" height="360">
    <img src="https://raw.githubusercontent.com/tikazyq/my-static-files/master/artipub/wechat-profile.jpg" height="360">
</p>
