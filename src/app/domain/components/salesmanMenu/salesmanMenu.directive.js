'use strict';

(function() {

  angular
    .module('webPage')
    .directive('salesmanMenu', salesmanMenu);

  function salesmanMenu() {
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
