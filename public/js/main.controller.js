angular.module('gsv')
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

    var urlSegment = {
      '3.4': '3.4',
      '3.5': '3.5',
      '3.7': '3.7',
      '3.8': '3.8'
    }[version] || 'v' + version;

    $scope.gulpDocsUrl = 'https://github.com/gulpjs/gulp/blob/' + urlSegment + '/docs/API.md';
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
});