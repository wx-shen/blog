// webpack：生产模式默认配置（Terser 压缩），不开 source map
module.exports = {
  mode: 'production',
  entry: './fixture/entry.js',
  output: { path: __dirname + '/dist/webpack', filename: 'bundle.js' },
  devtool: false,
  performance: { hints: false },
};
