const path = require("path")
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

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
  optimization: {
    minimizer: [new UglifyJsPlugin({
      include: [
        'src',
        'node_modules',
      ],
    })]
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: "popup.html",
      template: "./src/popup/popup.html"
    }),
    new CopyWebpackPlugin([
      'src/manifest.json',
      'src/icon.png',
      'src/antd.min.css',
    ])
  ]
}
