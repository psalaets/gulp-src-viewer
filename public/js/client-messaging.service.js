angular.module('gsv')
.factory('clientMessaging', function($rootScope) {
  var allFilesListener, selectedFilesListener, gulpVersionListener;
  var client = new Faye.Client('/faye');

  client.subscribe('/client/gulp-version', function(version) {
    if (gulpVersionListener) {
      $rootScope.$apply(gulpVersionListener.bind(null, version));
    }
  });

  client.subscribe('/client/all-files', function(files) {
    if (allFilesListener) {
      $rootScope.$apply(allFilesListener.bind(null, files));
    }
  });

  client.subscribe('/client/selected-files', function(files) {
    if (selectedFilesListener) {
      $rootScope.$apply(selectedFilesListener.bind(null, files));
    }
  });

  return {
    onGulpVersion: function(listener) {
      gulpVersionListener = listener;
    },
    onAllFiles: function(listener) {
      allFilesListener = listener;
    },
    onSelectedFiles: function(listener) {
      selectedFilesListener = listener;
    },
    sendPatterns: function(patterns) {
      client.publish('/server/patterns', patterns);
    },
    ready: function() {
      // notify server that front-end is ready
      client.publish('/server/ping', '');
    }
  };
});