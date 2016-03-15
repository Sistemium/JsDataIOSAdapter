'use strict';

(function () {
  function NavbarController(Auth,Menu,$window,$scope) {

    var vm = this;

    angular.extend(vm, {

      menu: Menu.root (),

      isCollapsed: true,

      toggleFullScreen: function () {

        if ($window.webkit) {
          $window.webkit.messageHandlers.tabbar.postMessage({
            action: vm.isFullScreen ? 'show' : 'hide'
          });
          vm.isFullScreen = !vm.isFullScreen;
        }

      }

    }, Auth);

    vm.toggleFullScreen();

    $scope.$on('$stateChangeSuccess', function (e, to) {
      vm.hide = !! _.get(to, 'data.hideTopBar');
    });

  }

  angular.module('webPage')
    .controller('NavbarController', NavbarController);

})();
