module.exports = function (gulp, plugins, getPath, join) {
  return (done) => {
    let karmaServer = require('karma').Server;
    let path = getPath({type: 'folder', name: 'js'});

    return new karmaServer({
      configFile: join(path, 'tests/karma.conf.js'),
      singleRun: true
    }, done).start();
  };
};
