'use strict';

(function () {

  function scrolledToEnd($timeout) {

    return {

      restrict: 'A',
      scope: 'true',

      link: function (scope, el, attrs) {

        el.bind('scroll', function (evt) {
          if (el[0].scrollHeight <= el[0].scrollTop + el[0].offsetHeight) {
            console.error('scrolledToEnd');
          }
        });

      }
    }

  }

  angular.module('sistemium.directives')
    .directive('scrolledToEnd', scrolledToEnd);

})();
