module.exports = function (gulp, plugins, getPath, join) {
  return () => {
    let path = getPath({'type': 'folder', 'name': 'demo'});

    return gulp.src(join(path, '**/*.html'))
      // Minify Any HTML
      .pipe(plugins.if('*.html', plugins.htmlmin({collapseWhitespace: true})))
      // Output Files
      .pipe(gulp.dest(path))
      .pipe(plugins.size({title: 'Total compressed html size:'}));
  };
};
