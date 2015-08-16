angular.module('gsv', [])
.controller('MainCtrl', function($scope, clientMessaging) {
  $scope.selectionBreakdown = generateSelectionBreakdown([]);
  $scope.files = [];

  $scope.handlePatternChange = function(patterns) {
    clientMessaging.sendPatterns(patterns);
    $scope.patterns = patterns;
  };

  clientMessaging.onGulpVersion(function(version) {
    $scope.gulpVersion = version;
    // https://github.com/gulpjs/gulp/blob/v3.8.10/docs/API.md
    $scope.gulpDocsUrl = 'https://github.com/gulpjs/gulp/blob/v' + version + '/docs/API.md';
  });

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
.directive('codeBox', function() {
  return {
    restrict: 'E',
    scope: {
      patterns: '='
    },
    controller: function($scope) {
      var quote = "'";
      var indent = "  ";

      $scope.singleQuote = setQuoteStyle.bind(null, "'");
      $scope.doubleQuote = setQuoteStyle.bind(null, '"');

      function setQuoteStyle(quoteStyle) {
        quote = quoteStyle;
        updateCode($scope.patterns);
      }

      $scope.$watch('patterns', updateCode, 'deep');

      function updateCode(patterns) {
        if (!patterns) return;

        var front = '\nvar patterns = [\n';
        var middle = patterns.map(function(pattern, index) {
          return indent + quote + pattern + quote + comma(index, patterns);
        }).join('\n');
        var end = '\n]\n';

        $scope.code = front + middle + end;
      }

      function comma(index, array) {
        return index == array.length - 1 ? '' : ',';
      }
    },
    // template is embedded in index.html
    templateUrl: 'code-box'
  };
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
})