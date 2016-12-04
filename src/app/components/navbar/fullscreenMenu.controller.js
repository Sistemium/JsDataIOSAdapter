'use strict';

(function () {

  function FullScreenMenuController(saControllerHelper, IOS, $scope) {

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

  angular.module('webPage')
    .controller('FullScreenMenuController', FullScreenMenuController);

})();
