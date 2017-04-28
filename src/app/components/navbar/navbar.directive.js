(function () {

  function acmeNavbar() {
    return {

      restrict: 'E',
      templateUrl: 'app/components/navbar/root-navbar.html',

      scope: {},

      controller: NavbarController,
      controllerAs: 'vm',
      bindToController: true

    };
  }

  function NavbarController(Auth, Menu, $scope, $rootScope, saControllerHelper, UnsyncedInfoService) {

    const DEFAULT_TITLE = 'Главное меню';
    const vm = saControllerHelper.setup(this, $scope);

    UnsyncedInfoService.bind(unsyncedInfo);

    vm.use({

      auth: Auth,
      menu: Menu.root(),
      rootClick: () => $rootScope.$broadcast('rootClick')

    });

    $scope.$on('$stateChangeSuccess', onStateChange);
    $scope.$on('$stateChangeStart', onStateChange);

    function onStateChange(event, to) {

      vm.use({
        hide: !!_.get(to, 'data.hideTopBar'),
        hideNavs: !!_.get(to, 'data.hideNavs'),
        title: _.get(to, 'data.title') || DEFAULT_TITLE,
        isRootState: to.name === 'home',
        currentItem: _.find(vm.menu.items, item => to.name && _.startsWith(to.name, item.state)),
        isSalesState: _.startsWith(to.name, 'sales.'),
        isCatalogueState: _.startsWith(to.name, 'sales.catalogue')
      });

    }

    function unsyncedInfo(obj) {

      vm.haveUnsyncedObjects = (_.first(obj) === 'haveUnsyncedObjects');
      $scope.$apply();

    }

  }

  angular
    .module('webPage')
    .directive('navbar', acmeNavbar);

})();
