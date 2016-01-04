import gulp from 'gulp';
import del from 'del';
import path from 'path';
import runSequence from 'run-sequence';

const join = path.join;

const plugins = require('gulp-load-plugins')({
  scope: ['dependencies']
});

const projectMap = {
  folder: {
    tmp: '/.tmp',
    build: '/app/dist',
    bower: '/app/dist/vendor',
    templates: '/app/templates',
    demo: '/app/demo',
    fonts: '/app/fonts',
    images: '/app/images',
    js: '/app/scripts',
    scss: '/app/styles'
  },
  file: {
    main_css: 'main.css',
    main_js: 'main.js',
    main_min_css: 'main.min.css',
    main_min_js: 'main.min.js',
    index_html: 'index.html'
  }
};

let getPath = function (path) {
  return join(path.type === 'folder' ?  __dirname : '',
    projectMap[path.type][path.name]);
};

let buildPath = getPath({type: 'folder', name: 'build'});

function getTask(task) {
  return require('./gulp-tasks/'.concat(task))(gulp, plugins, getPath, join);
}

gulp.task('bower:autocomplete', getTask('bower-autocomplete'));
gulp.task('css:compile', getTask('css-compile'));
gulp.task('css:lint', getTask('css-lint'));
gulp.task('html:compress', getTask('html-compress'));
gulp.task('html:concat', getTask('html-concat'));
gulp.task('html:replace', getTask('html-replace'));
gulp.task('image:compress', getTask('image-compress'));
gulp.task('js:compress', getTask('js-compress'));
gulp.task('js:concat', getTask('js-concat'));
gulp.task('js:eslint', getTask('js-eslint'));
gulp.task('js:test', getTask('js-test'));

// gulp.task('image:copy', getTask('image-copy'));
// gulp.task('font:copy', getTask('font-copy'));
// gulp.task('js:relocate_vendor', getTask('js-relocate-vendor'));

gulp.task('js', () => {
  return runSequence(
    'js:eslint',
    'js:concat',
    'js:compress'
  );
});

gulp.task('css', () => {
  return runSequence(
    'css:lint',
    'css:compile'
  );
});

// ################################################################################
// ##                            Update app version.                             ##
// ################################################################################
function updateVersion(importance) {
  // get all the files to bump version in
  return gulp.src(['./package.json', './bower.json', './npm-shrinkwrap.json'])
    // Bump the version number in those files.
    .pipe(plugins.bump({
      type: importance
    }))
    // Save it.
    .pipe(gulp.dest('./'));
   // Cool stuff for automatically using git.
   // Don't forget to install gulp-git plugin.
   // .pipe(git.commit('Bumps package version.'))
   // .pipe(filter('package.json'))
   // Tag in the git-repository.
   // .pipe(tag_version());
}

gulp.task('patch', () => {
  return updateVersion('patch');
});

gulp.task('feature', () => {
  return updateVersion('minor');
});

gulp.task('release', () => {
  return updateVersion('major');
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

// ################################################################################
// ##                          Build production files.                           ##
// ################################################################################
gulp.task('build', ['clean'], function (callback) {
  runSequence(
    [
      'css:lint',
      'js:eslint',
      'js:concat',
      'html:concat'
      //'js:relocate_vendor'
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

gulp.task('help', () => {
  console.log('The list of available tasks:');
  plugins.taskListing();
});

gulp.task('default', ['help'], () => {});
