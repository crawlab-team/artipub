## ArtiPub 浏览器扩展
### 使用方式
#### chrome
下载chrome.zip文件，解压后，在设置-扩展中，选择“加载已解压缩的扩展”进行使用
#### firefox
下载firefox.xpi文件，拖动到浏览器即可安装。
### 下载地址
#### github
* [chrome](https://raw.githubusercontent.com/crawlab-team/artipub/extensions/chrome.zip)
* [firefox](https://raw.githubusercontent.com/crawlab-team/artipub/extensions/firefox.xpi)
#### jsdelivr
* [chrome](https://cdn.jsdelivr.net/gh/crawlab-team/artipub@extensions/chrome.zip)
* [firefox](https://cdn.jsdelivr.net/gh/crawlab-team/artipub@extensions/firefox.xpi)
### 编译打包
**推荐使用`yarn`或`tyarn`进行编译打包，npm可能会出错**

安装依赖后运行`yarn run build`便可以打包，或者运行`yarn run build:chrome`单独打包chrome扩展、运行`yarn run build:firefox`单独打包firefox扩展。

#### 注意

打包firefox扩展时，将会检测环境变量`WEB_EXT_API_KEY`、`WEB_EXT_API_SECRET`是否存在。

若存在，将会使用Mozilla的`Web-Ext`进行打包，生成的扩展包为已签名的包，可以直接使用。

否则会生成未签名包，只能在firefox中打开`about:debugging#/runtime/this-firefox`，从“临时载入扩展组件”中加载使用。

配置环境变量可以使用`.env`文件，配置详见`webpac.prod.js`文件

`WEB_EXT_API_KEY`、`WEB_EXT_API_SECRET`获取方式见 [access-credentials](https://addons-server.readthedocs.io/en/latest/topics/api/auth.html#access-credentials)，关于firefox的Web-Ext的详细信息在 [getting-started-with-web-ext](https://extensionworkshop.com/documentation/develop/getting-started-with-web-ext/)或github上 [mozilla/web-ext](https://github.com/mozilla/web-ext)可以找到。

### Thanks
[abhijithvijayan/web-extension-starter](https://github.com/abhijithvijayan/web-extension-starter)
