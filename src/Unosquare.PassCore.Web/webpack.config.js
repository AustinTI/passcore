﻿// Imports
const { AngularCompilerPlugin } = require('@ngtools/webpack')
const AngularNamedLazyChunksWebpackPlugin = require('angular-named-lazy-chunks-webpack-plugin')
const { BaseHrefWebpackPlugin } = require('base-href-webpack-plugin')
const CompressionPlugin = require('compression-webpack-plugin')
const HappyPack = require('happypack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MinifyPlugin = require('babel-minify-webpack-plugin')
const path = require('path')

// Vars
let nodeModulesRegEx = /(\\|\/)node_modules(\\|\/)/
let happyThreadPool = HappyPack.ThreadPool({ size: 6 })

// Webpack configuration
module.exports = {
  mode: 'production',
  entry: {
    vendor: './ClientApp/vendor-aot.ts',
    app: './ClientApp/boot-aot.ts'
  },
  resolve: {
    extensions: ['.js', '.ts']
  },
  output: {
    path: path.join(process.cwd(), './wwwroot'),
    publicPath: '/',
    filename: '[name].bundle.js',
    chunkFilename: '[id].chunk.js'
  },
  module: {
    rules: [
      // AOT TS-compile-to-JS
      {
        test: /\.ts$/,
        enforce: 'pre',
        use: '@ngtools/webpack',
        exclude: nodeModulesRegEx
      },
      // Async loader
      {
        test: /\.async\.(html|css)$/,
        use: 'happypack/loader?id=async',
        exclude: nodeModulesRegEx
      },
      // URL file loader
      {
        test: /\.(eot|svg|cur)$/,
        use: 'happypack/loader?id=urls',
        exclude: nodeModulesRegEx
      },
      // Raw file loader
      {
        test: /\.(jpg|png|webp|gif|otf|ttf|woff|woff2|ani|html|css)$/,
        use: 'happypack/loader?id=files',
        exclude: [nodeModulesRegEx, /\.async\.(html|css)$/]
      },
      // Render JS into usable browser content
      {
        test: /\.js$/,
        enforce: 'post',
        loaders: 'happypack/loader?id=js',
        exclude: [nodeModulesRegEx]
      }
    ]
  },
  plugins: [
    new AngularCompilerPlugin({
      tsConfigPath: './ClientApp/tsconfig.json',
      entryModule: './ClientApp/app/app.module#AppModule',
      sourceMap: true
    }),
    new AngularNamedLazyChunksWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: './ClientApp/index.html',
      filename: './wwwroot/index.html'
    }),
    new BaseHrefWebpackPlugin({ baseHref: '/' }),
    new HappyPack({
      id: 'files',
      threadPool: happyThreadPool,
      loaders: ['file-loader?name=[name].[hash].[ext]']
    }),
    new HappyPack({
      id: 'async',
      threadPool: happyThreadPool,
      loaders: ['file-loader?name=[name].[hash].[ext]']
    }),
    new HappyPack({
      id: 'urls',
      threadPool: happyThreadPool,
      loaders: ['url-loader?name=[name].[hash].[ext]&limit=10000']
    }),
    new HappyPack({
      id: 'js',
      threadPool: happyThreadPool,
      loaders: ['babel-loader?presets[]=es2015', 'angular-router-loader?aot=true&genDir=aot/', 'angular2-template-loader?keepUrl=true']
    }),
    new MinifyPlugin(),
    new CompressionPlugin({minRatio: 0.8})
  ],
  node: {
    fs: 'empty',
    global: true,
    crypto: 'empty',
    tls: 'empty',
    net: 'empty',
    process: true,
    module: false,
    clearImmediate: false,
    setImmediate: false
  },
  devServer: {
    historyApiFallback: true
  },
  optimization: {
    runtimeChunk: 'single'
  }
}
