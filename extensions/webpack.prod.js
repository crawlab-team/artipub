const path = require('path');
const fs = require('fs');
require('dotenv').config();
const FilemanagerPlugin = require('filemanager-webpack-plugin');
const webExt = require('web-ext');
const { getExtensionFileType } = require('./webpack.common');
const destPath = path.join(__dirname, 'extension');
const targetBrowser = process.env.TARGET_BROWSER;
const webExtApiSecret = process.env.WEB_EXT_API_SECRET;
const webExtApiKey = process.env.WEB_EXT_API_KEY;
/**
 * web-ext webpack plugin
 */
class webExtPlugin {
  constructor({
    sourceDir = process.cwd(),
    artifactsDir = path.join(sourceDir, 'web-ext-artifacts'),
    apiKey,
    apiSecret,
    verbose = false,
  } = {}) {
    this.sourceDir = path.resolve(__dirname, sourceDir);
    this.artifactsDir = artifactsDir;
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.verbose = verbose;
  }
  apply(compiler) {
    const afterEmit = async (compilation) => {
      const signingResult = await webExt.cmd.sign({
        sourceDir: this.sourceDir,
        artifactsDir: this.artifactsDir,
        apiKey: this.apiKey,
        apiSecret: this.apiSecret,
        verbose: this.verbose
      });
      if (signingResult.success) {
        fs.renameSync(signingResult.downloadedFiles[0], path.join(destPath, 'firefox.xpi'))
      }
    }
    compiler.hooks.afterEmit.tapPromise({ name: 'webExtPlugin' }, afterEmit);
  }
}

const packageExtensionPlugin = () => {
  if (targetBrowser === 'firefox' && webExtApiKey !== 'undefined') {
    console.log('use Web-Ext');
    return new webExtPlugin({
      sourceDir: path.join(destPath, targetBrowser),
      artifactsDir: destPath,
      apiKey: webExtApiKey,
      apiSecret: webExtApiSecret,
    })
  }
  return new FilemanagerPlugin({
    events: {
      onEnd: {
        archive: [
          {
            format: 'zip',
            source: path.join(destPath, targetBrowser),
            destination: `${path.join(destPath, targetBrowser)}.${getExtensionFileType(targetBrowser)}`,
            options: { zlib: { level: 6 } },
          },
        ],
      },
    },
  });
}
module.exports = {
  // devtool: false, // https://github.com/webpack/webpack/issues/1194#issuecomment-560382342

  mode: 'production',
  optimization: {
    minimizer: [
      packageExtensionPlugin(),
    ],
  },
};
