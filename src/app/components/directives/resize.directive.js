'use strict';

(function () {

  function resize($window, $uibPosition, $timeout) {

    const SCREEN_XS_MAX = 768;

    return (scope, element, attrs) => {

      let property = attrs.resize ? (scope[attrs.resize] = {}) : scope;

      if (attrs.resizeFn){
        scope.resizeFn = scope.$eval(attrs.resizeFn);
      }

      let offsetTopMinus = attrs.resizeOffsetTop ? parseInt(attrs.resizeOffsetTop) : 0;

      function resizeOffsetTop(newValue) {
        if (!newValue || newValue.disableResize) return;
        element.css({'max-height': (newValue.windowHeight - newValue.offsetTop - offsetTopMinus) + 'px'});
      }

      function getWindowDimensions() {
        let offset = $uibPosition.offset(element);
        //let bodyRect = $window.document.body.getBoundingClientRect();
        return {
          windowHeight: $window.innerHeight,// - bodyRect.top,
          windowWidth: $window.innerWidth,
          offsetTop: offset ? offset.top : 0,
          disableResize: scope.hasInputInFocus
        };
      }

      function setValues(newValue) {
        if (!newValue || newValue.disableResize) return;
        _.assign(property, newValue);
        _.assign(property, {
          xsWidth: _.get(newValue, 'windowWidth') < SCREEN_XS_MAX
        });
        if (scope.resizeFn) scope.resizeFn(property, element);
      }

      let un = scope.$watch(
        getWindowDimensions,
        angular.isDefined(attrs.resizeOffsetTop) ? resizeOffsetTop : setValues,
        true
      );

      let apply = _.throttle(() => {
        scope.$apply();
      }, 100);

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
