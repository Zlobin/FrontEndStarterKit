// ################################################################################
// ##    Make css from scss, compile, add browser prefixes and minification.     ##
// ################################################################################
module.exports = function (gulp, plugins, getPath, join) {
  return () => {
    let path = getPath({'type': 'folder', 'name': 'scss'});
    let buildPath = getPath({type: 'folder', name: 'build'});
    let supportingBrowsers = [
      '> 3%',
      'last 2 versions',
      'ie 9',
      'ie 10'
    ];

    // For best performance, don't add Sass partials to `gulp.src`.
    gulp.src([
        join(path, '**/*.scss'),
        join('!', path, 'vendor/**')
      ])
      .pipe(plugins.changed('styles', {extension: '.scss'}))
      .pipe(plugins.rubySass({
        style: 'expanded',
        precision: 10,
        require: 'sass-globbing'
      }))
      .on('error', console.error.bind(console))
      .pipe(gulp.dest(join(buildPath, 'css')))
      // Add auto-prefixes.
      .pipe(plugins.if('*.css',
        plugins.autoprefixer(supportingBrowsers)
      ))
      // Concatenate And Minify Styles.
      .pipe(plugins.if('*.css', plugins.cssnano()))
      // Rename to .min.css.
      .pipe(plugins.if('*.css',
        plugins.rename({
          extname: '.min.css'
        })
      ))
      .pipe(gulp.dest(join(buildPath, 'css')))
      .pipe(plugins.size({title: 'Total compressed css files (with source maps) size:'}));
  };
};
