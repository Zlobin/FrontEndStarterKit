module.exports = function (gulp, plugins, getPath, join) {
  return () => {
    let buildPath = getPath({type: 'folder', name: 'build'});
    let path = join(buildPath, 'js');
    let fileName = getPath({type: 'file', name: 'main_js'});

    return gulp.src(join(path, fileName))
      .pipe(plugins.sourcemaps.init())
      .pipe(plugins.stripDebug())
      .pipe(plugins.uglify())
      .pipe(plugins.rename({
        extname: '.min.js'
      }))
      // For using ES2015.
      .pipe(plugins.babel({
        presets: ['es2015']
      }))
      .pipe(plugins.sourcemaps.write('.'))
      .pipe(gulp.dest(path))
      .pipe(plugins.size({title: 'Total compressed JavaScript files (with source maps) size:'}));
  };
};
