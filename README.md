# ArtiPub

文章自动发布管理工具

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

## 为什么创建这个工具

程序员和技术人员常常会写技术文章和博客，用作技术分享、产品分享或提供咨询等等。技术博主通常需要在多个媒体渠道发布文章，例如掘金、SegmentFault、CSDN、知乎、简书、微信公众号等等，以求最大的关注度。但是，发布文章到这么多平台费时费神，需要不断地复制粘贴；同时，作者想查看阅读数时还需要来回切换各个网站来进行统计。这非常不方便。

ArtiPub主要就是为了来解决上述这些问题的。
