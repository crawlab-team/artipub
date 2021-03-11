const path = require("path")
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const WebExtPlugin = require('web-ext-plugin');

module.exports = {
  entry: {
    popup: path.join(__dirname, "src/popup/index.tsx"),
  },
  output: {
    path: path.join(__dirname, "dist"),
    filename: "[name].js"
  },
  module: {
    rules: [
      {
        exclude: /node_modules/,
        test: /\.tsx?$/,
        use: "ts-loader"
      },
      {
        exclude: /node_modules/,
        test: /\.scss$/,
        use: [
          {
            loader: "style-loader" // Creates style nodes from JS strings
          },
          {
            loader: "css-loader" // Translates CSS into CommonJS
          },
          {
            loader: "sass-loader" // Compiles Sass to CSS
          }
        ]
      }
    ]
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"]
  },
  optimization: { //使用代码自动分割
    splitChunks: {
      chunks: 'all'
    }
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: "popup.html",
      template: "./src/popup/popup.html"
    }),
    new CopyWebpackPlugin([
      'src/manifest.json',
      'src/icon.png',
      'src/antd.min.css'
    ]),
    new WebExtPlugin({
      sourceDir: path.join(__dirname, "dist")
    })
  ]
}
