'use strict';

(function () {

  function resize($window, IOS) {

    return function (scope) {
      var w = $window;
      scope.getWindowDimensions = function () {
        return {
          'h': w.innerHeight,
          'w': w.innerWidth
        };
      };
      var desktopFix = IOS.isIos() ? 0 : 45;
      scope.$watch(scope.getWindowDimensions, function (newValue) {
        scope.windowHeight = newValue.h - desktopFix;
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
