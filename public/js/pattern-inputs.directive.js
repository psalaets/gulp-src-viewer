angular.module('gsv')
.directive('patternInputs', function() {
  return {
    restrict: 'E',
    scope: {
      onPatternChange: '&'
    },
    controller: function($scope) {
      $scope.ngModelOptions = {
        // milliseconds
        debounce: 200
      };

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
});