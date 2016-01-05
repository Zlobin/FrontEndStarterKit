module.exports = function (gulp, plugins, getPath, join) {
  return () => {
    var path = getPath({type: 'folder', name: 'images'});
    var pngquant = require('imagemin-pngquant');

    return gulp.src(join(path, '**/*'))
      .pipe(plugins.size({title: 'Total images size before compression:'}))
      .pipe(plugins.cache(plugins.imagemin({
        progressive: true,
        interlaced: true,
        // Don't remove IDs from SVGs, they are often used
        // as hooks for embedding and styling.
        svgoPlugins: [{
          removeViewBox: false
        }],
        use: [pngquant({
          quality: '50-70',
          speed: 4
        })]
      })))
      .pipe(plugins.size({title: 'Total images size after compression:'}));
  };
};
