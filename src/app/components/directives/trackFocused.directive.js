'use strict';

(function () {

  let inFocus = false;

  function trackFocused(IOS, $rootScope, $timeout) {
    return {

      restrict: 'A',

      link: function (scope, element) {

        if (!IOS.isIos()) return;

        element.on('focus', function () {
          inFocus = true;
          $rootScope.hasInputInFocus = true;
          // $rootScope.$apply();
        });

        element.on('blur', function () {
          // console.warn(arguments);
          inFocus = false;
          $timeout(500).then(() => {
            $rootScope.hasInputInFocus = inFocus;
          });
        });

      }

    };
  }

  angular.module('sistemium.directives')
    .directive('trackFocused', trackFocused);

})();
