'use strict';

(function () {

  function resize($window, $uibPosition, $timeout) {

    const SCREEN_XS_MAX = 480;

    return (scope, element, attrs) => {

      var property = attrs.resize ? (scope[attrs.resize] = {}) : scope;

      function getWindowDimensions() {
        var offset = $uibPosition.offset(element);
        return {
          windowHeight: $window.innerHeight,
          windowWidth: $window.innerWidth,
          offsetTop: offset ? offset.top : 0
        };
      }

      function setValues(newValue) {
        _.assign(property, newValue);
        _.assign(property, {
          xsWidth: newValue.windowWidth < SCREEN_XS_MAX
        });
      }

      var un = scope.$watch(getWindowDimensions, setValues, true);

      function apply() {
        scope.$apply();
      }

      angular.element($window)
        .bind('resize', apply);

      scope.$on('$destroy', ()=> {
        un();
        angular.element($window)
          .unbind('resize', apply);
      });

      $timeout(setValues);
    }

  }

  angular.module('sistemium')
    .directive('resize', resize);

})();
