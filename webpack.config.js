module.exports = {
  entry: __dirname + '/src/hello-storage.js',
  output: {
    path: __dirname,
    filename: 'hello-storage.js',
    libraryTarget: 'umd',
    library: 'HelloStorage',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['env']
          },
        },
      },
    ],
  },
}