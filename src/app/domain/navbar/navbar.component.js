(function () {

  angular.module('webPage')
    .component('navbar', {

      templateUrl: 'app/domain/navbar/navbar.html',

      scope: {},

      controller: NavbarController,
      controllerAs: 'vm'

    });

  function NavbarController(Auth, Menu, $scope, $rootScope, saControllerHelper, $window, localStorageService, $state) {

    const DEFAULT_TITLE = 'Главное меню';
    const vm = saControllerHelper.setup(this, $scope);

    vm.use({

      backClick,
      auth: Auth,
      menu: Menu.root(),
      rootClick: () => $rootScope.$broadcast('rootClick')

    });

    $scope.$on('$stateChangeSuccess', onStateChange);

    if (localStorageService.get('debug.performance')) {
      setTimeout(measure, 1000);
    }

    /*
    Functions
     */

    function backClick() {

      $state.go('^');

    }

    function onStateChange(event, to) {

      let rootState = _.get(to, 'data.rootState');

      vm.use({
        sales: Auth.isAuthorized(['salesman', 'supervisor']),
        state: to,
        hide: !!_.get(to, 'data.hideTopBar'),
        hideNavs: !!_.get(to, 'data.hideNavs'),
        title: _.get(to, 'data.title') || DEFAULT_TITLE,
        isHomeState: to.name === 'home',
        currentItem: _.find(vm.menu.items, item => to.name && _.startsWith(to.name, item.state)),
        isSalesState: _.startsWith(to.name, 'sales.'),
        isCatalogueState: _.startsWith(to.name, 'sales.catalogue'),
        isSubRootState: _.startsWith(to.name, rootState) && to.name !== rootState
      });

    }

    function measure() {
      let a = $window.performance.now();
      $rootScope.$apply();
      vm.lastDigest = Math.round($window.performance.now() - a);
      setTimeout(measure, 2000);
    }

  }

})();
