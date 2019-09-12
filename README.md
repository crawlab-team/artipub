# ArtiPub

文章自动发布管理工具

## 安装要求

- MongoDB 3.6+
- NodeJS 8.12+

## 安装方式

ArtiPub提供3种安装方式如下。

- [Docker](#通过Docker安装) (大约5分钟): 适合对Docker有一定基础的开发者
- [npm](#通过npm包安装) (大约3分钟): 适合熟悉Node.js或npm的开发者
- [源码](#通过源码安装) (大约5-10分钟): 适合希望了解内核原理的开发者

### 通过Docker安装

通过Docker，可以免去

**安装Docker Compose

```bash
docker-compose
```

### 通过npm包安装

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

然后在浏览器中输入`http://localhost:8000`可以看到界面。

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

## 为什么创建这个工具

程序员和技术人员常常会写技术文章和博客，用作技术分享、产品分享或提供咨询等等。技术博主通常需要在多个媒体渠道发布文章，例如掘金、SegmentFault、CSDN、知乎、简书、微信公众号等等，以求最大的关注度。但是，发布文章到这么多平台费时费神，需要不断地复制粘贴；同时，作者想查看阅读数时还需要来回切换各个网站来进行统计。这非常不方便。

ArtiPub主要就是为了来解决上述这些问题的。
