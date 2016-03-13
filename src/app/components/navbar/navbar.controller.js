'use strict';

(function () {
  function NavbarController(Auth,Menu,$window) {

    var vm = this;

    angular.extend(vm, {

      menu: Menu.root (),

      isCollapsed: true,

      toggleFullScreen: function () {

        if ($window.webkit) {
          $window.webkit.messageHandlers.tabbar.postMessage({
            action: vm.isFullScreen ? 'show' : 'hide',
            options: {
              requestId: 1
            }
          });
          vm.isFullScreen = !vm.isFullScreen;
        }

      }

    }, Auth);

    vm.toggleFullScreen();

  }

  angular.module('webPage')
    .controller('NavbarController', NavbarController);

})();
