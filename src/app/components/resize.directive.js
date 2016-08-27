'use strict';

(function () {

  function resize($window, $uibPosition) {

    return (scope, element) => {

      function getWindowDimensions () {
        return {
          windowHeight: $window.innerHeight,
          windowWidth: $window.innerWidth,
          offsetTop: $uibPosition.offset(element).top
        };
      }

      scope.$watch(getWindowDimensions, newValue => _.assign(scope,newValue), true);

      angular.element($window).bind('resize', () => scope.$apply());

    }

  }

  angular.module('sistemium')
    .directive('resize', resize);

})();
