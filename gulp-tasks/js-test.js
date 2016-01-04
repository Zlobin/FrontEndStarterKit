/**
 * Run test once and exit.
 */
module.exports = function (gulp, plugins, getPath, join) {
  return (done) => {
    let karmaServer = require('karma').Server;
    let path = getPath({type: 'folder', name: 'js'});

    new karmaServer({
      configFile: join(path, 'tests/karma.conf.js'),
      singleRun: true
    }, done).start();
  };
};
