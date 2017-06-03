'use strict';

(function() {

  angular.module('webPage')
    .directive('fullscreenMenu', fullScreenMenu);

  function fullScreenMenu() {
    return {

      restrict: 'E',
      templateUrl: 'app/components/navbar/fullscreenMenu.html',
      scope: {
      },
      controller: fullScreenMenuController,
      controllerAs: 'vm',
      bindToController: true

    };
  }

  function fullScreenMenuController(saControllerHelper, IOS, $scope) {

    let vm = saControllerHelper.setup(this, $scope);

    vm.use({

      isFullScreen: false,
      toggleFullScreen: false,

      fullScreenButtonClass,
      fullScreenButtonTitle

    });

    toggleFullScreen();

    function toggleFullScreen() {

      if (IOS.isIos()) {
        IOS.handler('tabbar').postMessage({
          action: vm.isFullScreen ? 'show' : 'hide'
        });
        vm.isFullScreen = !vm.isFullScreen;
        if (!vm.toggleFullScreen) {
          vm.toggleFullScreen = toggleFullScreen;
        }
      }

    }

    function fullScreenButtonClass() {
      return vm.isFullScreen ? 'glyphicon-resize-small' : 'glyphicon-resize-full';
    }

    function fullScreenButtonTitle() {
      return vm.isFullScreen ? 'Свернуть' : 'Развернуть';
    }

  }

})();
