/**
 *
 *  FrontEnd Starter Kit.
 *  Copyright 2015 Eugene Zlobin. All rights reserved.
 *
 */

'use strict';

// Include gulp & tools we'll use.
var gulp = require('gulp');
var del = require('del');
var join = require('path').join;
var pngquant = require('imagemin-pngquant');
var runSequence = require('run-sequence');
var pkg = require('./package.json');

var plugins = require('gulp-load-plugins')({
  scope: ['dependencies']
});

var projectMap = {
  folder: {
    tmp: '/.tmp',
    build: '/build',
    bower: '/build/vendor',
    templates: '/templates',
    demo: '/demo',
    fonts: '/fonts',
    images: '/images',
    js: '/javascripts',
    scss: '/stylesheets'
  },
  file: {
    main_css: 'main.css',
    main_js: 'main.js',
    main_min_css: 'main.min.css',
    main_min_js: 'main.min.js',
    index_html: 'index.html'
  }
};

var getPath = function (path) {
  return join(path.type === 'folder' ?  __dirname : '', projectMap[path.type][path.name]);
};

var buildPath = getPath({type: 'folder', name: 'build'});
var supportingBrowsers = [
  '> 3%',
  'last 2 versions',
  'ie 9',
  'ie 10'
];

// ################################################################################
// ##                            JavaScript linting.                             ##
// ################################################################################
gulp.task('js_hint', function () {
  var path = getPath({type: 'folder', name: 'js'});

  return gulp.src([
      join(path, '**/*.js'),
      // Exclude test path.
      join('!', path, 'tests/**')
    ])
    .pipe(plugins.jshint())
    .pipe(plugins.jshint.reporter('jshint-stylish'))
    .pipe(plugins.size({title: 'Total uncompressed js files size:'}));
});

// ################################################################################
// ##                          JavaScript compression.                           ##
// ################################################################################
gulp.task('js_compress', function () {
  var path = join(buildPath, 'js');
  var fileName = getPath({type: 'file', name: 'main_js'});

  gulp.src(join(path, fileName))
    .pipe(plugins.sourcemaps.init())
      .pipe(plugins.uglify())
      .pipe(plugins.rename({
        extname: '.min.js'
      }))
    // For using ES6
    //.pipe(plugins.babel())
    .pipe(plugins.sourcemaps.write('.'))
    .pipe(gulp.dest(path))
    .pipe(plugins.size({title: 'Total compressed js file size:'}));
});

// ################################################################################
// ##                         JavaScript concatination.                          ##
// ################################################################################
gulp.task('js_concat', function () {
  var path = getPath({type: 'folder', name: 'js'});
  var fileName = getPath({type: 'file', name: 'main_js'});
  var filesOrder = [
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
    .pipe(gulp.dest(join(buildPath, 'js')));
});

// ################################################################################
// ##                Relocation JavaScript vendor files (bower).                 ##
// ################################################################################
gulp.task('js_relocate_vendor', function () {
  var path = getPath({type: 'folder', name: 'bower'});
  var files = [
    join(path, '**/*.min.js'),
    join(path, '**/*-min.js')
  ];

  gulp.src(files)
    .pipe(plugins.sourcemaps.init())
      .pipe(plugins.flatten())
    .pipe(plugins.sourcemaps.write('../maps'))
    .pipe(gulp.dest(join(buildPath, 'js/vendor')));
});

// ################################################################################
// ##                                Lint SCSS.                                  ##
// ################################################################################
gulp.task('scss_lint', function () {
  var path = getPath({'type': 'folder', 'name': 'scss'});

  gulp.src(join(path, '**/*.scss'))
    .pipe(plugins.size({title: 'Total scss files size:'}))
    .pipe(plugins.scssLint());
});

// ################################################################################
// ##    Make css from scss, compile, add browser prefixes and minification.     ##
// ################################################################################
gulp.task('css_make', function () {
  var path = getPath({'type': 'folder', 'name': 'scss'});

  // For best performance, don't add Sass partials to `gulp.src`.
  return gulp.src([
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
    .pipe(plugins.if('*.css', plugins.minifyCss()))
    // Rename to .min.css.
    .pipe(plugins.if('*.css',
      plugins.rename({
        extname: '.min.css'
      })
    ))
    .pipe(gulp.dest(join(buildPath, 'css')))
    .pipe(plugins.size({title: 'Total compressed css file size:'}));
});

// ################################################################################
// ##                            Compress images.                                ##
// ################################################################################
gulp.task('image_compress', function () {
  var path = getPath({type: 'folder', name: 'images'});

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
});

// ################################################################################
// ##                           Glue html templates.                             ##
// ################################################################################
gulp.task('html_concat', function () {
  var path = getPath({'type': 'folder', 'name': 'templates'});
  var demoPath = getPath({'type': 'folder', 'name': 'demo'});
  var indexFile = getPath({'type': 'file', 'name': 'index_html'});

  gulp.src([join(path, indexFile)])
    .pipe(plugins.fileInclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(gulp.dest(demoPath))
    .pipe(plugins.size({title: 'Total uncompressed html size:'}));
});

// ################################################################################
// ##                         Install bower components.                          ##
// ################################################################################
gulp.task('bower_install', function () {
  gulp.src(['./bower.json'])
    .pipe(plugins.install());
});

// ################################################################################
// ##                   NPM lock down dependency versions.                       ##
// ################################################################################
gulp.task('npm_shrinkwrap', function () {
  return gulp.src('./package.json')
    .pipe(plugins.shrinkwrap());
});


// ################################################################################
// ##                          Inject bower components.                          ##
// ################################################################################
gulp.task('bower_autocomplete', function () {
  var wiredep = require('wiredep').stream;
  var path = getPath({'type': 'folder', 'name': 'demo'});
  var vendorPath = getPath({'type': 'folder', 'name': 'bower'});

  gulp.src(join(path, '*.html'))
    .pipe(wiredep({
      directory: vendorPath,
      ignorePath: /^(\.\.\/)*\.\./
    }))
    .pipe(gulp.dest(path));
});

// ################################################################################
// ##                             HTML replacing.                                ##
// ################################################################################
gulp.task('html_replace', function () {
  var path = getPath({'type': 'folder', 'name': 'demo'});
  var build = '/build';

  return gulp.src(join(path, '**/*.html'))
    .pipe(plugins.htmlReplace({
      js: {
        src: join(build, 'js', getPath({'type': 'file', 'name': 'main_min_js'})),
        tpl: '<script src="%s"></script>'
      },
      css: {
        src: join(build, 'css', getPath({'type': 'file', 'name': 'main_min_css'})),
        tpl: '<link rel="stylesheet" href="%s">'
      },
      title: {
        src: pkg.name + ', v.' + pkg.version,
        tpl: '<title>%s</title>'
      }
      // generating: 'generated on ' + (new Date).toISOString().split('T')[0] + ' using ' + pkg.name + ' ' + pkg.version
    }))
    // Output Files
    .pipe(gulp.dest(path));
});

// ################################################################################
// ##                          Scan and compress HTML.                          ##
// ################################################################################
gulp.task('html_compress', function () {
  var path = getPath({'type': 'folder', 'name': 'demo'});

  return gulp.src(join(path, '**/*.html'))
    // Minify Any HTML
    .pipe(plugins.if('*.html', plugins.minifyHtml()))
    // Output Files
    .pipe(gulp.dest(path))
    .pipe(plugins.size({title: 'Total compressed html size:'}));
});

// ################################################################################
// ##                   Clean output and temp directories.                       ##
// ################################################################################
gulp.task('clean', del.bind(null, [
  join(getPath({type: 'folder', name: 'tmp'}), '*'),
  join(getPath({type: 'folder', name: 'demo'}), '*'),
  join(buildPath, 'js/*'),
  join(buildPath, 'css/*')
]));

/**
 * Run test once and exit.
 */
gulp.task('test', function () {
  var karma = require('karma').server;
  var path = getPath({type: 'folder', name: 'js'});

  karma.start({
    configFile: join(path, 'tests/karma.conf.js'),
    singleRun: true
  });
});

// ################################################################################
// ##                            Update app version.                             ##
// ################################################################################
function updateVersion(importance) {
  // get all the files to bump version in
  return gulp.src(['./package.json', './bower.json', './npm-shrinkwrap.json'])
    // Bump the version number in those files.
    .pipe(plugins.bump({type: importance}))
    // Save it.
    .pipe(gulp.dest('./'));

    /*
      // Cool stuff for automatically using git.
      // Don't forget to install gulp-git plugin.
      .pipe(git.commit('Bumps package version.'))
      .pipe(filter('package.json'))
      // Tag in the git-repository.
      .pipe(tag_version());
    */
}

gulp.task('patch', function () { return updateVersion('patch'); });
gulp.task('feature', function () { return updateVersion('minor'); });
gulp.task('release', function () { return updateVersion('major'); });

// ################################################################################
// ##                          Build production files.                           ##
// ################################################################################
gulp.task('build', ['clean', 'bower_install'], function (callback) {
  runSequence(
    [
      'npm_shrinkwrap',
      'scss_lint',
      'js_hint',
      'js_concat',
      'html_concat'
      //'js_relocate_vendor'
    ],
    [
      'css_make',
      'bower_autocomplete'
    ],
    [
      'html_replace'
    ],
    [
      'image_compress',
      'js_compress',
      'html_compress'
    ],
    [
      'test'
    ],
    callback);
});

// ################################################################################
// ##                              Default task.                                 ##
// ################################################################################
gulp.task('default', function (callback) {
  console.log('Please use params: build, test, patch, feature or release');
});
