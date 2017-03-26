'use strict';

(function() {

  angular
    .module('webPage')
    .directive('salesmanMenu', salesmansMenu);

  function salesmansMenu() {
    return {

      restrict: 'E',
      templateUrl: 'app/domain/components/salesmanMenu/salesmanMenu.html',
      scope: {
      },
      controller: 'SalesmanMenuController',
      controllerAs: 'vm',
      bindToController: true

    };
  }

})();
