// Rspack：生产模式默认配置（SWC 压缩），不开 source map
module.exports = {
  mode: 'production',
  entry: './fixture/entry.js',
  output: { path: __dirname + '/dist/rspack', filename: 'bundle.js' },
  devtool: false,
  performance: { hints: false },
};
