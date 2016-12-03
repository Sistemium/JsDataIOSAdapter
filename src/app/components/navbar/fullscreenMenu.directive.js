(function() {
  'use strict';

  angular
    .module('webPage')
    .directive('fullscreenMenu', fullscreenMenu);

  function fullscreenMenu() {
    return {

      restrict: 'E',
      templateUrl: 'app/components/navbar/fullscreenMenu.html',
      scope: {
      },
      controller: 'FullscreenMenuController',
      controllerAs: 'vm',
      bindToController: true

    };
  }

})();
