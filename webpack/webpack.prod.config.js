require('babel-polyfill');

// Webpack config for creating the production bundle.
const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const strip = require('strip-loader');

module.exports = {
  devtool: 'source-map',
  context: path.resolve(__dirname, '..'),
  entry: {
    'main': [
      './js/src/index'
    ]
  },
  output: {
      path: path.join(__dirname, '../dist'),
      filename: 'react-draft-editor-ch.js',
      libraryTarget: 'commonjs2'
  },
  externals: {
    'react': 'react',
    'react-dom': 'react-dom',
    'draft-js': 'draft-js',
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: [
            {
                loader: strip.loader('debug')
            },
            {
                loader: 'babel-loader'
            }
        ]
      },
      {
          test: /\.css$/,
          use: ExtractTextPlugin.extract({
              fallback: 'style-loader',
              use: 'css-loader'
          })
      },
      {
          test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
          use: {
              loader: 'url-loader',
              options: {
                  limit: 10000,
                  mimetype: 'application/octet-stream'
              }
          }
      },
      {
          test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
          use: {
              loader: 'url-loader',
              options: {
                  limit: 10000,
                  mimetype: 'image/svg+xml'
              }
          }
      }
    ]
  },
  resolve: {
    modules: [
        path.resolve(__dirname, '../src'),
        "node_modules"
    ],
    extensions: ['.json', '.js', '.jsx']
  },
  plugins: [
    // css files from the extract-text-plugin loader
    new ExtractTextPlugin({
        filename: 'react-draft-editor-ch.css',
        allChunks: true
    }),
    // ignore dev config
    new webpack.IgnorePlugin(/\.\/dev/, /\/config$/),

    // optimizations
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
      compress: {
        warnings: false
      }
    })
  ]
};
