module.exports = function (gulp, plugins, getPath, join) {
  return () => {
    let imagesDirectory = getPath({type: 'folder', name: 'images'});
    let buildPath = getPath({type: 'folder', name: 'build'});
    let files = join(imagesDirectory, '{,*/}*.{jpg,jpeg,png,gif}');

    return gulp.src(files)
      .pipe(plugins.flatten())
      .pipe(gulp.dest(join(buildPath, 'images')));
  };
};
