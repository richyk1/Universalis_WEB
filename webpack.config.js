const path = require('path');

module.exports = {
  mode: "development",
  entry: './src/public/javascripts/main.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
        
      },
    ],
  },
  devtool: 'inline-source-map',
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
  },
  output: {
    filename: 'bundle.js',
    chunkFilename: 'chunk.bundle.js',
    path: path.resolve(__dirname, 'dist/public/javascripts'),
  },
  watch: true,
};
