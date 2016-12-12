'use strict';

(function () {

  function resize($window, $uibPosition, $timeout) {

    const SCREEN_XS_MAX = 768;

    return (scope, element, attrs) => {

      let property = attrs.resize ? (scope[attrs.resize] = {}) : scope;

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
          xsWidth: _.get(newValue, 'windowWidth') < SCREEN_XS_MAX
        });
      }

      let un = scope.$watch(getWindowDimensions, setValues, true);
      let apply = _.throttle(() => {
        // console.warn('throttle');
        scope.$apply();
      }, 1000, {leading: false});

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
