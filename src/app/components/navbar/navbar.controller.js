'use strict';

(function () {
  function NavbarController(Auth, Menu, $window, $scope, $state, $timeout, $rootScope, IOS) {

    var vm = this;

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

    angular.extend(vm, {

      menu: Menu.root(),

      isCollapsed: true,

      auth: Auth,

      onBrandClick: function () {
        if (vm.currentItem) {
          $state.go(vm.currentItem.state);
        }
      },

      onProfileClick: function () {
        $state.go(Auth.profileState);
      },

      rootClick: function () {
        $rootScope.$broadcast('rootClick');
      }

    });

    toggleFullScreen();

    $scope.$on('$stateChangeSuccess', function (e, to) {

      vm.hide = !!_.get(to, 'data.hideTopBar');
      vm.hideNavs = !! _.get(to, 'data.hideNavs');
      vm.title = _.get(to, 'data.title') || 'Системиум';
      vm.isRootState = (to.name === 'home');

      var item = _.find(vm.menu.items, function (item) {
        return to.name && _.startsWith(to.name, item.state);
      });

      $timeout(function () {
        vm.isCollapsed = true;
      }, 500);
      vm.currentItem = item;

    });

  }

  angular.module('webPage')
    .controller('NavbarController', NavbarController);

})();
