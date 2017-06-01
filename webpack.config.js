var webpack = require('webpack');
var path = require('path');
module.exports = {
  entry: './app/src/index.js',
  output: {
    library: 'app',
    filename: 'bundle.js',
    sourceMapFilename: 'bundle.js.map',
    path: path.resolve(__dirname, './ui/app'),
  },
  module: {
    loaders: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
    }],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
    new webpack.optimize.UglifyJsPlugin({
      comments: false,
    }),
  ],
  devtool: 'source-map',
};
