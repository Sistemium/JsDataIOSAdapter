'use strict';

(function () {

  function saClickOutside($document, $parse, IOS) {

    return {

      restrict: 'A',

      link: function (scope, el, attrs) {

        if (!IOS.isIos()) return;

        let evaluateOnClick = $parse(attrs.saClickOutside);
        let outsideIf = attrs.outsideIf && $parse(attrs.outsideIf);

        let clicker = () => {
          if (outsideIf && outsideIf(scope)) {
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
