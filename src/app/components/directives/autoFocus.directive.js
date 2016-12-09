'use strict';

(function () {
  angular.module('core.services')
    .directive('autoFocus', autoFocus);

  function autoFocus($timeout) {
    return {
      restrict: 'AC',
      scope: {
        autoFocus: '@'
      },
      link: function (_scope, _element) {

        if (_scope.autoFocus === 'false'){
          return;
        }

        $timeout(function () {
          _element[0].focus();
        }, 10);

        if (_scope.autoFocus !== 'true'){
          return;
        }

        _element.bind('blur', function () {
          $timeout(function () {
            _element[0].focus();
          }, 100);
        });

      }
    };
  }

})();
