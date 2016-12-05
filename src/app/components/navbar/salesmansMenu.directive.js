(function() {
  'use strict';

  angular
    .module('webPage')
    .directive('salesmansMenu', salesmansMenu);

  function salesmansMenu() {
    return {

      restrict: 'E',
      templateUrl: 'app/components/navbar/salesmansMenu.html',
      scope: {
      },
      controller: 'SalesmansMenuController',
      controllerAs: 'vm',
      bindToController: true

    };
  }

})();
