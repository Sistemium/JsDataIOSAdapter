'use strict';

(function () {

  const BROADCAST_NAME = 'onStmClicked';
  const EMIT_NAME = 'stmClicked';

  function stmClick() {
    return {

      restrict: 'A',

      scope: {
        clickPayload: '=?'
      },

      link: function ($scope, elem, attrs) {
        let code = attrs.stmClick;
        let payload = $scope.clickPayload;
        elem.bind('click', event => {
          event.preventDefault();
          $scope.$emit(EMIT_NAME, code, event, payload);
        });
      }

    };
  }

  function broadcaster($rootScope) {

    $rootScope.$on(
      EMIT_NAME,
      (clickEvent, code, domEvent, payload) => $rootScope.$broadcast(BROADCAST_NAME, code, domEvent, payload)
    );

  }

  function ClickHelper() {

    return {
      setupController
    };

    function setupController(vm, scope) {
      scope.$on(BROADCAST_NAME, (broadcastEvent, code, domEvent, payload) => {
        let fn = _.get(vm, `${code}Click`);
        if (_.isFunction(fn)) {
          fn(payload, domEvent);
        }
      });
    }
  }

  angular.module('sistemium')
    .directive('stmClick', stmClick)
    .run(broadcaster)
    .service('ClickHelper', ClickHelper);

})();
