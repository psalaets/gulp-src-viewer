angular.module('gsv', [])
.controller('MainCtrl', function($scope, clientMessaging) {

  $scope.files = [];
  $scope.patterns = [{
    value: ''
  }];

  $scope.$watch('patterns', function(newValue, oldValue) {
    if (newValue !== oldValue) {
      var patterns = newValue.map(function(patternObject) {
        return patternObject.value;
      });

      clientMessaging.sendPatterns(patterns);
    }
  }, 'deep');

  clientMessaging.onAllFiles(function(files) {
    files.sort(byPath);
    $scope.files = files;
  });

  clientMessaging.onSelectedFiles(function(selectedFiles) {
    markSelected($scope.files, selectedFiles);
  });

  clientMessaging.ready();

  function markSelected(files, selectedFiles) {
    // make "is selected?" check easier
    var selectedPaths = selectedFiles.reduce(function(prev, curr) {
      prev[curr.path] = true;
      return prev;
    }, {});

    files.forEach(function(file) {
      file.selected = file.path in selectedPaths;
    });
  }

  function byPath(file1, file2) {
    return file1.path.localeCompare(file2.path);
  }
})
.factory('clientMessaging', function($rootScope) {
  var allFilesListener, selectedFilesListener;
  var client = new Faye.Client('/faye');

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
})