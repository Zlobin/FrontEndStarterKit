module.exports = function (gulp, plugins, getPath, join) {
  return () => {
    let wiredep = require('wiredep').stream;
    let path = getPath({'type': 'folder', 'name': 'demo'});
    let vendorPath = getPath({'type': 'folder', 'name': 'bower'});

    return gulp.src(join(path, '*.html'))
      .pipe(wiredep({
        directory: vendorPath,
        ignorePath: /^(\.\.\/)*\.\./
      }))
      .pipe(gulp.dest(path));
  };
};
