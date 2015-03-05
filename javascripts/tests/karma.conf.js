// Karma configuration.

module.exports = function(config) {
  config.set({
    // Base path that will be used to resolve all patterns (eg. files, exclude).
    basFPath: '../',
    // Frameworks to use.
    // Available frameworks: https://npmjs.org/browse/keyword/karma-adapter.
    frameworks: ['mocha', 'sinon-chai'],
    // List of files / patterns to load in the browser.
    files: [
      // Vendors.
      '../../build/vendor/jquery/dist/jquery.min.js',

      // All JavaScript project files.
      // ...
      '../main.js',
      // ...

      // ----------------- Fixtures -----------------
      'fixtures/**/*.js',
      // ----------------- Tests -----------------
      'spec/**/*.js',

      // ----------------- Setup UI testing -----------------
      'setup.js'
    ],
    // List of files to exclude.
    exclude: [
    ],
    // Preprocess matching files before serving them to the browser.
    // Available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor.
    preprocessors: {
      'helpers/**/*.js': ['coverage'],
      'modules/**/*.js': ['coverage']
    },
    coverageReporter: {
      type : 'text-summary',
      dir : 'coverage'
    },
    junitReporter: {
      outputFile: 'report/atv.xml'
    },
    // West results reporter to use.
    // Possible values: 'dots', 'progress'.
    // Available reporters: https://npmjs.org/browse/keyword/karma-reporter.
    reporters: ['progress', 'coverage'],
    // Web server port.
    port: 9876,
    // Enable / disable colors in the output (reporters and logs).
    colors: true,
    // Level of logging.
    // Possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG.
    logLevel: config.LOG_INFO,
    // Enable / disable watching file and executing tests whenever any file changes.
    autoWatch: false,
    // Start these browsers.
    // Available browser launchers: https://npmjs.org/browse/keyword/karma-launcher.
    browsers: ['PhantomJS'],
    // Continuous Integration mode.
    // If true, Karma captures browsers, runs the tests and exits.
    singleRun: true
  });
};
