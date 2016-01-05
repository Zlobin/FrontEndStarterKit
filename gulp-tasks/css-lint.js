module.exports = function (gulp, plugins, getPath, join) {
  return () => {
    let path = getPath({'type': 'folder', 'name': 'scss'});

    return gulp.src(join(path, '**/*.scss'))
      .pipe(plugins.size({title: 'Total scss files size:'}))
      .pipe(plugins.scssLint({
        'config': '.scsslint.yml'
      }));
  };
};