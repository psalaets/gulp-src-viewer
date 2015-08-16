var server = require('./lib/server');
var serverMessaging = require('./lib/server-messaging')(server);

var gulpSrcWrapper = require('./lib/gulp-src-wrapper');

serverMessaging.on('client-ready', function() {
  var allFiles = '**';

  gulpSrcWrapper.run(allFiles, function(error, files) {
    serverMessaging.allFiles(files);
  });
});

serverMessaging.on('patterns', function(patterns) {
  gulpSrcWrapper.run(patterns, function(error, files) {
    serverMessaging.selectedFiles(files);
  });
});