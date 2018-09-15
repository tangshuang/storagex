var gulp = require('gulp')
var bufferify = require('gulp-bufferify').default
var babel = require('gulp-babel')

gulp.src('src/hello-storage.js')
  .pipe(babel({
    presets: ['env'],
  }))
  .pipe(bufferify(function(content) {

    content = content.replace(/Object\.defineProperty\(exports,[\s\S]+?\);/gm, '')
    content = content.replace(`exports.default = HelloStorage;`, '')
    content = content.replace(`window.sessionStorage`, 'root.sessionStorage')
    content = `
!function(root) {

${content}

if (typeof define === 'function' && (define.cmd || define.amd)) { // amd | cmd
  define(function(require, exports, module) {
    module.exports = HelloStorage;
  });
}
else if (typeof module !== 'undefined' && module.exports) {
  module.exports = HelloStorage;
}
else {
  root['hello-storage'] = HelloStorage;
}

} (typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : this);
    `
    content = content.trim()
    content += "\n"

    return content
  }))
  .pipe(gulp.dest('dist'))