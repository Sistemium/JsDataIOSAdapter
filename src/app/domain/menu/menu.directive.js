(function() {
  'use strict';

  angular
    .module('webPage')
    .directive('stmMenu', acmeNavbar);

  /** @ngInject */
  function acmeNavbar() {
    return {

      restrict: 'AC',
      templateUrl: 'app/domain/menu/menu.html',
      scope: {
        header: '=',
        items: '='
      }

    };
  }

})();
