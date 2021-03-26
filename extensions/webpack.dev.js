
const ExtensionReloader = require('webpack-extension-reloader');

class packageExtensionPlugin {
  constructor() { }
  apply(compiler) {
    const afterEmit = async (compilation) => {
      console.log(`WEB_EXT_API_KEY: ${process.env.WEB_EXT_API_KEY}`);
    }
    compiler.hooks.afterEmit.tapPromise({ name: 'packageExtensionPlugin' }, afterEmit);
  }
}
module.exports = {
  devtool: 'cheap-source-map',
  mode: 'development',
  plugins: [
    // plugin to enable browser reloading in development mode
    new ExtensionReloader({
      port: 9090,
      reloadPage: true,
      entries: {
        // TODO: reload manifest on update
        contentScript: 'contentScript',
        background: 'background',
        extensionPage: ['popup', 'options'],
      },
    })
  ],
  optimization: {
    minimizer: [
      new packageExtensionPlugin(),
    ],
  },
};
