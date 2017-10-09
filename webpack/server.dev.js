const path = require('path');
const webpack = require('webpack');
const config = require('./webpack.dev.config');
const express = require('express');

const app = express();
const compiler = webpack(config);

app.use(require('webpack-dev-middleware')(compiler, {
  noInfo: true,
  publicPath: config.output.publicPath,
}));

app.use(require('webpack-hot-middleware')(compiler));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../demo/index.html'));
});

app.listen(3001, '127.0.0.1', (err) => {
  if (err) {
    console.log(err);
    return;
  }
  console.log('Listening at http://localhost:3001');
});
