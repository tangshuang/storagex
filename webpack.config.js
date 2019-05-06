module.exports = {
  mode: 'none',
  entry: __dirname + '/src/storagex.js',
  output: {
    path: __dirname + '/dist',
    filename: 'storagex.js',
    library: 'storagex',
    libraryTarget: 'umd',
    globalObject: `typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : this`,
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
