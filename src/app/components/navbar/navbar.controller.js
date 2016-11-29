'use strict';

(function () {
  function NavbarController(Auth, Menu, $scope, $state, $timeout, $rootScope, IOS, saControllerHelper, SalesmanAuth) {

    var vm = saControllerHelper.setup(this, $scope);

    vm.use({

      auth: Auth,
      menu: Menu.root(),

      isCollapsed: true,
      selectedSalesman: undefined,

      onBrandClick: () => {
        if (vm.currentItem) {
          $state.go(vm.currentItem.state)
        }
      },
      onProfileClick: () => $state.go(Auth.profileState),
      rootClick: () => $rootScope.$broadcast('rootClick'),

      fullscreenButtonClass,
      fullscreenButtonTitle,
      salesmanClick,
      salesmanMenuTitle

    });

    toggleFullScreen();

    var salesman = SalesmanAuth.getCurrentUser();

    if (salesman) {
      vm.selectedSalesman = salesman;
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
      return vm.isFullScreen? 'glyphicon-resize-small' : 'glyphicon-resize-full';
    }

    function fullscreenButtonTitle() {
      return vm.isFullScreen? 'Свернуть' : 'Развернуть';
    }

    function salesmanClick() {
      console.log('show salesmans list to select one');
    }

    function salesmanMenuTitle() {
      return vm.selectedSalesman ? vm.selectedSalesman : 'Выбрать салесмана';
    }

    $scope.$on('$stateChangeSuccess', (e, to) => {

      vm.hide = !!_.get(to, 'data.hideTopBar');
      vm.hideNavs = !! _.get(to, 'data.hideNavs');
      vm.title = _.get(to, 'data.title') || 'Системиум';
      vm.isRootState = (to.name === 'home');

      var item = _.find(vm.menu.items, function (item) {
        return to.name && _.startsWith(to.name, item.state);
      });

      $timeout(() => vm.isCollapsed = true, 500);
      vm.currentItem = item;

    });

  }

  angular.module('webPage')
    .controller('NavbarController', NavbarController);

})();
