# ArtiPub

![](https://img.shields.io/github/release/crawlab-team/artipub)
![](https://img.shields.io/github/last-commit/crawlab-team/artipub)
![](https://img.shields.io/github/issues/crawlab-team/artipub)
![](https://img.shields.io/docker/pulls/tikazyq/artipub?logo=docker)
![](https://img.shields.io/npm/dw/artipub?logo=npm)
![](https://img.shields.io/github/license/crawlab-team/artipub)

ArtiPub (Article Publisher的简称，意为"文章发布者")是一款开源的一文多发平台，可以帮助文章作者将编写好的文章自动发布到掘金、SegmentFault、CSDN、知乎、开源中国等技术媒体平台，传播优质知识，获取最大的曝光度。ArtiPub安装简单，提供了多种安装方式，可以一键安装使用，安装一般只要5分钟。

ArtiPub目前支持文章编辑、文章发布、数据统计的功能，后期我们会加入存量文章导入、数据分析的功能，让您更好的管理、优化您的技术文章。此外，我们还会接入更多媒体渠道，真正做到让文章随处可阅。

## 预览截图

#### 平台管理

![](https://raw.githubusercontent.com/tikazyq/my-static-files/master/artipub/screenshots/artipub-platform.png)

#### 文章管理

![](https://raw.githubusercontent.com/tikazyq/my-static-files/master/artipub/screenshots/artipub-article.png)

#### 文章编辑

![](https://raw.githubusercontent.com/tikazyq/my-static-files/master/artipub/screenshots/artipub-article-edit.png)

#### 文章发布

![](https://raw.githubusercontent.com/tikazyq/my-static-files/master/artipub/screenshots/artipub-article-publish.png)

#### Chrome插件

![](https://raw.githubusercontent.com/tikazyq/my-static-files/master/artipub/screenshots/artipub-extension.png)

## 安装要求

#### Docker安装

- Docker: 18.03
- Docker Compose: 1.24.1

#### NPM或源码安装

- MongoDB: 3.6+
- NodeJS: 8.12+

## 安装方式

ArtiPub提供3种安装方式如下。

- [Docker](#通过Docker安装) (大约5分钟): 适合对Docker有一定基础的开发者
- [npm](#通过npm包安装) (大约3分钟): 适合熟悉Node.js或npm的开发者
- [源码](#通过源码安装) (大约5-10分钟): 适合希望了解内核原理的开发者

### 通过Docker安装

通过Docker，可以免去安装MongoDB的步骤，也是我们最推荐的安装方式。使用Docker安装ArtiPub前，请确保您安装了Docker以及Docker Compose。

在您的项目目录下创建`docker-compose.yaml`文件，输入如下内容。

```yaml
version: '3.3'
services:
  app:
    image: "tikazyq/artipub:latest"
    environment:
      MONGO_HOST: "mongo"
      ARTIPUB_API_ADDRESS: "localhost:3000" # 后端API地址，如果安装地址不在本机，请修改为服务器IP地址+端口号（默认为3000）
    ports:
      - "8000:8000" # frontend
      - "3000:3000" # backend
    depends_on:
      - mongo
  mongo:
    image: mongo:latest
    restart: always
    ports:
      - "27017:27017"
```

然后在命令行中输入如下命令。

```bash
docker-compose up
```

然后在浏览器中输入`http://localhost:8000`可以看到界面。

注意⚠️，如果您的Docker宿主机不是本机，例如您用了Docker Machine或者Docker服务在其他机器上，您需要将环境变量`ARTIPUB_API_ADDRESS`改为宿主机IP+端口号（默认3000）。然后，在浏览器输入`http://<宿主机IP>:8000`即可看到界面。

### 通过npm包安装

如果您对npm熟悉，且已经有MongoDB的环境，这是最为快捷的方式。

**安装npm包**

```bash
npm install -g artipub
```

安装npm包时，为了加速下载速度，可以加入`--registry`参数来设置镜像源（后面源码安装时也可以这样操作）

```bash
npm install -g artipub --registry=https://registry.npm.taobao.org
```

**运行ArtiPub**

```bash
artipub start
```

该命令默认会使用`localhost:27017/artipub`为MongoDB数据库链接。输入如下命令可以看更多配置，例如配置数据库等。

```bash
artipub -h
```

成功运行后，在浏览器中输入`http://localhost:8000`可以看到界面。

### 通过源码安装

**克隆Github Repo**

```bash
git clone https://github.com/crawlab-team/artipub
```

**安装npm包**

```bash
cd artipub
npm install
```

**启动前端**

```bash
npm run start:frontend
```

**启动后端**

```bash
npm run start:backend
```

**配置数据库**

数据库的配置在`./config.js`中，可以按情况配置。

**配置后端API地址**

如果您部署的服务不在本机，需要在`./src/config/config.ts`中将`apiEndpoint`改成对应的IP地址+端口。

## 为什么创建ArtiPub

程序员和技术人员常常会写技术文章和博客，用作技术分享、产品分享或提供咨询等等。技术博主通常需要在多个媒体渠道发布文章，例如掘金、SegmentFault、CSDN、知乎、简书、微信公众号等等，以求最大的关注度。但是，发布文章到这么多平台费时费神，需要不断地复制粘贴；同时，作者想查看阅读数时还需要来回切换各个网站来进行统计。这非常不方便。ArtiPub主要就是为了来解决上述这些问题的。

市面上已经存在一文多发平台了，例如OpenWrite，为何还要创建ArtiPub呢？或许其他一文多发平台也是一个替代方案，但它们要求用户将自己的账户信息例如Cookie或账号密码上传到对方服务器，这很不安全，一旦平台发生问题，自己的账户信息会遭到泄漏。虽然我相信一般平台不会恶意操作用户的账户，但如果出现误操作，您的账户隐私将遭到泄漏，平台上的财产也可能遭到损坏，有这样的风险需要考虑。ArtiPub不要求用户上传账户信息，所有账户信息全部保存在用户自己的数据库里，因此规避了这个安全风险。

另外，由于ArtiPub是开源的，JS源码也比较易于理解，可扩展性很强，用户如果有其他平台的接入需求，完全可以更改源码来实现自己的需求，不用等待平台更新。开发组也将持续开发ArtiPub，将其打造得更实用和易用。

## 支持平台

- [x] [掘金](https://juejin.im)
- [x] [SegmentFault](https://segmentfault.com)
- [x] [CSDN](https://csdn.net)
- [x] [简书](https://jianshu.com)
- [x] [知乎](https://zhihu.com)
- [x] [开源中国](https://oschina.net)
- [x] [今日头条](https://toutiao.com)
- [x] [博客园](https://cnblogs.com)
- [ ] [微博](https://weibo.com)
- [ ] [百度百家号](https://baijiahao.baidu.com)
- [ ] [51CTO](https://51cto.com)
- [ ] [开发者头条](https://toutiao.io)
- [ ] 微信公众号

## 贡献代码

非常欢迎优秀的开发者来贡献ArtiPub。在提Pull Request之前，请首先阅读源码，了解原理和架构。如果不懂的可以加作者微信 tikazyq1 注明 ArtiPub。

## 社区

如果您觉得 ArtiPub 对您有帮助，请扫描下方群二维码，如果群满，请加作者微信 tikazyq1 并注明"ArtiPub"，作者会将你拉入群。

<p align="center">
    <img src="https://raw.githubusercontent.com/tikazyq/my-static-files/master/artipub/wechat-group.jpg" height="360">
    <img src="https://raw.githubusercontent.com/tikazyq/my-static-files/master/artipub/wechat-profile.jpg" height="360">
</p>
