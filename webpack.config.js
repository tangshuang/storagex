module.exports = {
  mode: 'none',
  entry: __dirname + '/src/hello-storage.js',
  output: {
    path: __dirname + '/dist',
    filename: 'hello-storage.js',
    library: 'hello-storage',
    libraryTarget: 'umd',
    globalObject: 'typeof window !== undefined ? window : typeof global !== undefined ? global : typeof self !== undefined ? self : this',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader',
      },
    ]
  },
}
