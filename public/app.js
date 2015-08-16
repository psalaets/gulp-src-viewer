angular.module('gsv', [])
.controller('MainCtrl', function($scope, clientMessaging) {
  $scope.selectionBreakdown = generateSelectionBreakdown([]);
  $scope.files = [];

  $scope.sendPatterns = function(patterns) {
    clientMessaging.sendPatterns(patterns);
  };

  clientMessaging.onAllFiles(function(files) {
    files.sort(byPath);
    $scope.files = files;
  });

  clientMessaging.onSelectedFiles(function(selectedFiles) {
    markSelected($scope.files, selectedFiles);
    $scope.selectionBreakdown = generateSelectionBreakdown(selectedFiles);
  });

  clientMessaging.ready();

  function generateSelectionBreakdown(selectedFiles) {
    return selectedFiles.reduce(function(counts, selected) {
      counts.total += 1;

      if (selected.type == 'file') {
        counts.files += 1;
      } else if (selected.type == 'directory') {
        counts.directories += 1;
      }

      return counts;
    }, {files: 0, directories: 0, total: 0});
  }

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
.directive('selectionBreakdown', function() {
  return {
    restrict: 'E',
    scope: {
      breakdown: '='
    },
    // template is embedded in index.html
    templateUrl: 'selection-breakdown'
  };
})
.directive('patternInputs', function() {
  return {
    restrict: 'E',
    scope: {
      onPatternChange: '&'
    },
    controller: function($scope) {
      $scope.patterns = [newPattern()];
      focusInput(0);

      $scope.$watch('patterns', function(newValue, oldValue) {
        if (newValue !== oldValue) {
          var patterns = newValue.map(function(patternObject) {
            return patternObject.value;
          });

          $scope.onPatternChange({patterns: patterns});
        }
      }, 'deep');

      $scope.handleKey = function(event, index) {
        var handler = {
          8: handleBackspaceKey,
          13: handleEnterKey
        }[event.keyCode];

        handler && handler(index);
      };

      function handleEnterKey(index) {
        addPattern(index);
        focusInput(index + 1);
      }

      function handleBackspaceKey(index) {
        if (patternCount() > 1 && hasEmptyPatternAt(index)) {
          removePattern(index);
          focusInput(index - 1);
        }
      }

      function focusInput(index) {
        if (index < 0) {
          index = 0;
        }

        // HackCity 3000
        setTimeout(function() {
          document.getElementById('pattern-' + index).focus();
        }, 0)
      }

      function hasEmptyPatternAt(index) {
        return $scope.patterns[index].value.length == 0;
      }

      function addPattern(afterIndex) {
        $scope.patterns.splice(afterIndex + 1, 0, newPattern());
      }

      function newPattern() {
        return {
          value: ''
        };
      }

      function patternCount() {
        return $scope.patterns.length;
      }

      function removePattern(index) {
        $scope.patterns.splice(index, 1);
      }
    },
    // template is embedded in index.html
    templateUrl: 'pattern-inputs'
  };
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