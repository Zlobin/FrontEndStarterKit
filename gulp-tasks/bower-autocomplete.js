// ################################################################################
// ##                          Inject bower components.                          ##
// ################################################################################
module.exports = function (gulp, plugins, getPath, join) {
  return () => {
    let wiredep = require('wiredep').stream;
    var path = getPath({'type': 'folder', 'name': 'demo'});
    var vendorPath = getPath({'type': 'folder', 'name': 'bower'});

    gulp.src(join(path, '*.html'))
      .pipe(wiredep({
        directory: vendorPath,
        ignorePath: /^(\.\.\/)*\.\./
      }))
      .pipe(gulp.dest(path));
  };
};
