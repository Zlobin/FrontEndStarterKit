/**
 *
 *  FrontEnd Starter Kit.
 *  Copyright 2015 Eugene Zlobin. All rights reserved.
 *
 */

'use strict';

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
gulp.task('js:hint', function () {
  var path = getPath({type: 'folder', name: 'js'});

  return gulp.src([
      join(path, '**/*.js'),
      // Exclude test path.
      join('!', path, 'tests/**')
    ])
    .pipe(plugins.jshint())
    .pipe(plugins.jshint.reporter('jshint-stylish'))
    .pipe(plugins.size({title: 'Total uncompressed JavaScript files size:'}));
});

// ################################################################################
// ##                          JavaScript compression.                           ##
// ################################################################################
gulp.task('js:compress', function () {
  var path = join(buildPath, 'js');
  var fileName = getPath({type: 'file', name: 'main_js'});

  return gulp.src(join(path, fileName))
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.stripDebug())
    .pipe(plugins.uglify())
    .pipe(plugins.rename({
      extname: '.min.js'
    }))
    // For using ES6
    //.pipe(plugins.babel())
    .pipe(plugins.sourcemaps.write('.'))
    .pipe(gulp.dest(path))
    .pipe(plugins.size({title: 'Total compressed JavaScript files (with source maps) size:'}));
});

// ################################################################################
// ##                         JavaScript concatenation.                          ##
// ################################################################################
gulp.task('js:concat', function () {
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
    .pipe(gulp.dest(join(buildPath, 'js')))
    .pipe(plugins.size({title: 'Total uncompressed main.js file size:'}));
});

// ################################################################################
// ##                Relocation JavaScript vendor files (bower).                 ##
// ################################################################################
gulp.task('js:relocate_vendor', function () {
  var path = getPath({type: 'folder', name: 'bower'});
  var files = [
    join(path, '**/*.min.js'),
    join(path, '**/*-min.js')
  ];

  return gulp.src(files)
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.flatten())
    .pipe(plugins.sourcemaps.write('../maps'))
    .pipe(gulp.dest(join(buildPath, 'js/vendor')));
});

// ################################################################################
// ##                                Lint SCSS.                                  ##
// ################################################################################
gulp.task('css:lint', function () {
  var path = getPath({'type': 'folder', 'name': 'scss'});

  return gulp.src(join(path, '**/*.scss'))
    .pipe(plugins.size({title: 'Total scss files size:'}))
    .pipe(plugins.scssLint({
      'config': '.scsslint.yml'
    }));
});

// ################################################################################
// ##    Make css from scss, compile, add browser prefixes and minification.     ##
// ################################################################################
gulp.task('css:compile', function () {
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
    .pipe(plugins.size({title: 'Total compressed css files (with source maps) size:'}));
});

// ################################################################################
// ##                            Compress images.                                ##
// ################################################################################
gulp.task('image:compress', function () {
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
gulp.task('html:concat', function () {
  var path = getPath({'type': 'folder', 'name': 'templates'});
  var demoPath = getPath({'type': 'folder', 'name': 'demo'});
  var indexFile = getPath({'type': 'file', 'name': 'index_html'});

  return gulp.src([join(path, indexFile)])
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
gulp.task('bower:install', function () {
  return gulp.src(['./bower.json'])
    .pipe(plugins.install());
});

// ################################################################################
// ##                   NPM lock down dependency versions.                       ##
// ################################################################################
gulp.task('npm:shrinkwrap', function () {
  return gulp.src('./package.json')
    .pipe(plugins.shrinkwrap());
});


// ################################################################################
// ##                          Inject bower components.                          ##
// ################################################################################
gulp.task('bower:autocomplete', function () {
  var wiredep = require('wiredep').stream;
  var path = getPath({'type': 'folder', 'name': 'demo'});
  var vendorPath = getPath({'type': 'folder', 'name': 'bower'});

  return gulp.src(join(path, '*.html'))
    .pipe(wiredep({
      directory: vendorPath,
      ignorePath: /^(\.\.\/)*\.\./
    }))
    .pipe(gulp.dest(path));
});

// ################################################################################
// ##                             HTML replacing.                                ##
// ################################################################################
gulp.task('html:replace', function () {
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
gulp.task('html:compress', function () {
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
gulp.task('js:test', function () {
  var karma = require('karma').server;
  var path = getPath({type: 'folder', name: 'js'});

  return karma.start({
    configFile: join(path, 'tests/karma.conf.js'),
    singleRun: true
  });
});

// ################################################################################
// ##                            Update app version.                             ##
// ################################################################################
function updateVersion (importance) {
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

gulp.task('patch', function () {
  return updateVersion('patch');
});
gulp.task('feature', function () {
  return updateVersion('minor');
});
gulp.task('release', function () {
  return updateVersion('major');
});

// ################################################################################
// ##                          Build production files.                           ##
// ################################################################################
gulp.task('build', ['clean', 'bower:install'], function (callback) {
  runSequence(
    [
      'npm:shrinkwrap',
      'css:lint',
      'js:hint',
      'js:concat',
      'html:concat'
      //'js_relocate_vendor'
    ],
    [
      'css:compile',
      'bower:autocomplete'
    ],
    [
      'html:replace'
    ],
    [
      'image:compress',
      'js:compress',
      'html:compress'
    ],
    [
      'js:test'
    ],
    callback);
});

gulp.task('help', function () {
  console.log('The list of available tasks:');
  plugins.taskListing();
});

gulp.task('default', ['help'], function () {});
