'use strict';

(function () {

  function resize($window) {

    return function (scope) {
      var w = $window;
      scope.getWindowDimensions = function () {
        return {
          'h': w.innerHeight,
          'w': w.innerWidth
        };
      };
      scope.$watch(scope.getWindowDimensions, function (newValue) {
        scope.windowHeight = newValue.h;
        scope.windowWidth = newValue.w;
      }, true);

      angular.element($window).bind('resize', function () {
        scope.$apply();
      });
    }

  }

  angular.module('sistemium')
    .directive('resize', resize);

})();
