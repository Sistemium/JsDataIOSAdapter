'use strict';

(function () {

  function NavbarController(Auth, Menu, $scope, $rootScope, saControllerHelper, $state, $timeout) {

    const DEFAULT_TITLE = 'Главное меню';
    const vm = saControllerHelper.setup(this, $scope);

    vm.use({

      auth: Auth,
      menu: Menu.root(),
      rootClick: () => $rootScope.$broadcast('rootClick'),
      onStateChange

    });

    $timeout(1000).then(()=> !vm.title && onStateChange($state.current));

    function onStateChange(to) {

      vm.use({
        hide: !!_.get(to, 'data.hideTopBar'),
        hideNavs: !!_.get(to, 'data.hideNavs'),
        title: _.get(to, 'data.title') || DEFAULT_TITLE,
        isRootState: to.name === 'home',
        currentItem: _.find(vm.menu.items, item => to.name && _.startsWith(to.name, item.state))
      });

    }

  }

  angular.module('webPage')
    .controller('NavbarController', NavbarController);

})();
