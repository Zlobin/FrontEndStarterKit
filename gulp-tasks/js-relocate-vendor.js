module.exports = function (gulp, plugins, getPath, join) {
  return () => {
    let path = getPath({type: 'folder', name: 'bower'});
    let buildPath = getPath({type: 'folder', name: 'build'});
    let files = [
      join(path, '**/*.min.js'),
      join(path, '**/*-min.js')
    ];

    return gulp.src(files)
      .pipe(plugins.sourcemaps.init())
      .pipe(plugins.flatten())
      .pipe(plugins.sourcemaps.write('../maps'))
      .pipe(gulp.dest(join(buildPath, 'js/vendor')));
  };
};
