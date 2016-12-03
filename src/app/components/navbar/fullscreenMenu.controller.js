'use strict';

(function () {

  function fullscreenMenuController(saControllerHelper, IOS, $scope, $state) {

    var vm = saControllerHelper.setup(this, $scope);

    vm.use({

      fullscreenButtonClass,
      fullscreenButtonTitle

    });

    checkState($state.current.name);
    toggleFullScreen();

    $scope.$on('$stateChangeSuccess', (e, to) => {
      checkState(to.name);
    });

    function checkState(stateName) {
      vm.isRootState = (stateName === 'home');
    }

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

    function fullscreenButtonClass() {
      return vm.isFullScreen ? 'glyphicon-resize-small' : 'glyphicon-resize-full';
    }

    function fullscreenButtonTitle() {
      return vm.isFullScreen ? 'Свернуть' : 'Развернуть';
    }

  }

  angular.module('webPage')
    .controller('FullscreenMenuController', fullscreenMenuController);

})();
