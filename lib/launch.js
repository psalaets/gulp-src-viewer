var open = require('open');

var server = require('./server');
var serverMessaging = require('./server-messaging')(server);
var makeGulpSrcWrapper = require('./gulp-src-wrapper');

module.exports = launch;

function launch(gulp) {
  var gulpSrcWrapper = makeGulpSrcWrapper(gulp);

  serverMessaging.on('client-ready', function() {
    var allFiles = ['**', '!node_modules/**/*'];

    gulpSrcWrapper.run(allFiles, function(error, files) {
      serverMessaging.allFiles(files);
    });
  });

  serverMessaging.on('patterns', function(patterns) {
    gulpSrcWrapper.run(patterns, function(error, files) {
      serverMessaging.selectedFiles(files);
    });
  });

  var port = 3333;
  server.listen(port, function() {
    console.log('Server listening on port ' + port);

    open('http://localhost:' + port);
  });
}