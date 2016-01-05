module.exports = function (gulp, plugins, getPath, join) {
  return () => {
    let path = getPath({type: 'folder', name: 'js'});
    let buildPath = getPath({type: 'folder', name: 'build'});
    let fileName = getPath({type: 'file', name: 'main_js'});
    let filesOrder = [
      // ...
      'main.js'
      // ...
    ].map(function(key) {
        return join(path, key);
      });

    return gulp.src(filesOrder)
      .pipe(plugins.concat({
        path: fileName,
        stat: {
          mode: '0666'
        }
      }))
      .pipe(gulp.dest(join(buildPath, 'js')))
      .pipe(plugins.size({title: 'Total uncompressed main.js file size:'}));
  };
};