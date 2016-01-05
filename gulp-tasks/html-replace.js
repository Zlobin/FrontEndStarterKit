module.exports = function (gulp, plugins, getPath, join) {
  return () => {
    let path = getPath({'type': 'folder', 'name': 'demo'});
    let build = '/app/dist';
    let pkg = require('../package.json');

    return gulp.src(join(path, '**/*.html'))
      .pipe(plugins.htmlReplace({
        js: {
          src: join(build, 'js', getPath({'type': 'file', 'name': 'main_min_js'})),
          tpl: '<script src="%s"></script>'
        },
        css: {
          src: join(build, 'css', getPath({'type': 'file', 'name': 'main_min_css'})),
          tpl: '<link rel="stylesheet" href="%s">'
        },
        title: {
          src: `${pkg.name}, v. ${pkg.version}`,
          tpl: '<title>%s</title>'
        }
      }))
      // Output Files
      .pipe(gulp.dest(path));
  };
};
