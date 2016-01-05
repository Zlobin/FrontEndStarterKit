module.exports = function (gulp, plugins, getPath, join) {
  return () => {
    let path = getPath({'type': 'folder', 'name': 'templates'});
    let demoPath = getPath({'type': 'folder', 'name': 'demo'});
    let indexFile = getPath({'type': 'file', 'name': 'index_html'});

    return gulp.src([join(path, indexFile)])
      .pipe(plugins.fileInclude({
        prefix: '@@',
        basepath: '@file'
      }))
      .pipe(gulp.dest(demoPath))
      .pipe(plugins.size({title: 'Total uncompressed html size:'}));
  };
};
