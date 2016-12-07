'use strict';

(function () {

  function selectOnFocus($window) {
    return {

      restrict: 'A',

      link: function (scope, element) {
        element.on('click', function () {
          if (!$window.getSelection().toString()) {
            // Required for mobile Safari
            this.setSelectionRange(0, this.value.length)
          }
        });
      }

    };
  }

  angular.module('sistemium')
    .directive('selectOnFocus', selectOnFocus);

})();