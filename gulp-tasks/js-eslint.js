module.exports = function (gulp, plugins, getPath, join) {
  return () => {
    let path = getPath({type: 'folder', name: 'js'});

    return gulp.src([
        join(path, '**/*.js'),
        // Exclude test path.
        join('!', path, 'tests/**')
      ])
      .pipe(plugins.eslint())
      .pipe(plugins.eslint.format())
      .pipe(plugins.size({title: 'Total uncompressed JavaScript files size:'}));
  };
};
