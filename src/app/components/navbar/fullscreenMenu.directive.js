'use strict';

(function() {

  angular
    .module('webPage')
    .directive('fullscreenMenu', fullScreenMenu);

  function fullScreenMenu() {
    return {

      restrict: 'E',
      templateUrl: 'app/components/navbar/fullscreenMenu.html',
      scope: {
      },
      controller: 'FullScreenMenuController',
      controllerAs: 'vm',
      bindToController: true

    };
  }

})();
