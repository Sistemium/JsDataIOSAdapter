'use strict';

(function () {

  angular.module('webPage')
    .component('fullscreenMenu', {

      scope: {},

      templateUrl: 'app/components/fullscreenMenu/fullscreenMenu.html',
      controller: fullScreenMenuController,
      controllerAs: 'vm'

    });

  function fullScreenMenuController(saControllerHelper, IOS, $scope, $timeout) {

    let vm = saControllerHelper.setup(this, $scope);

    vm.use({

      isFullScreen: false,
      toggleFullScreen: false,

      fullScreenButtonClass,
      fullScreenButtonTitle

    });

    if (IOS.isIos()) {
      vm.toggleFullScreen = toggleFullScreen;
      $timeout(500)
        .then(toggleFullScreen);
    }

    function toggleFullScreen() {

      IOS.handler('tabbar').postMessage({
        action: vm.isFullScreen ? 'show' : 'hide'
      });
      vm.isFullScreen = !vm.isFullScreen;

    }

    function fullScreenButtonClass() {
      return vm.isFullScreen ? 'glyphicon-resize-small' : 'glyphicon-resize-full';
    }

    function fullScreenButtonTitle() {
      return vm.isFullScreen ? 'Свернуть' : 'Развернуть';
    }

  }

})();
