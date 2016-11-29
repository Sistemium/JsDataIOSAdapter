(function() {
  'use strict';

  angular
    .module('webPage')
    .directive('navbarMenu', navbarMenu);

  function navbarMenu() {
    return {

      restrict: 'E',
      templateUrl: 'app/components/navbar/navbarMenu.html',
      scope: {
      },
      controller: 'NavbarMenuController',
      controllerAs: 'vm',
      bindToController: true

    };
  }

})();
