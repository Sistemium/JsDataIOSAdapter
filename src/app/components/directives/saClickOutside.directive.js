'use strict';

(function () {

  function saClickOutside($document, $parse, IOS) {

    return {

      restrict: 'A',

      link: function (scope, el, attrs) {

        if (!IOS.isIos()) return;

        let evaluateOnClick = $parse(attrs.saClickOutside);
        let alwaysOutside = angular.isDefined(attrs.alwaysOutside);

        let clicker = (e) => {
          if (alwaysOutside || el !== e.target && !el[0].contains(e.target)) {
            scope.$apply(() => evaluateOnClick(scope));
          }
        };

        $document.on('touchstart', clicker);

        scope.$on('$destroy', () => { $document.unbind('click', clicker); })

      }
    }

  }

  angular.module('sistemium')
    .directive('saClickOutside', saClickOutside);

})();
