'use strict';

(function () {
  function NavbarController(Auth, Menu, $scope, $state, $timeout, $rootScope, saControllerHelper) {

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
      rootClick: () => $rootScope.$broadcast('rootClick')

    });

    $scope.$on('$stateChangeSuccess', (e, to) => {

      vm.hide = !!_.get(to, 'data.hideTopBar');
      vm.hideNavs = !!_.get(to, 'data.hideNavs');
      vm.title = _.get(to, 'data.title') || 'Главное меню';
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
