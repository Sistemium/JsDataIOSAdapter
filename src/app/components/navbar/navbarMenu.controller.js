'use strict';

(function () {

  function navbarMenuController(saControllerHelper, Schema, IOS, $scope, SalesmanAuth) {

    var vm = saControllerHelper.setup(this, $scope);

    vm.use({

      fullscreenButtonClass,
      fullscreenButtonTitle,
      salesmanClick,
      salesmanMenuTitle

    });

    var {Salesman} = Schema.models();

    toggleFullScreen();

    $scope.$on('$stateChangeSuccess', (e, to) => {

      vm.hideNavs = !!_.get(to, 'data.hideNavs');
      vm.isRootState = (to.name === 'home');
      vm.isSalesState = _.startsWith(to.name, 'sales.');

      vm.showMenu = vm.isSalesState || (vm.isRootState && vm.toggleFullScreen);

    });

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

    function salesmanClick() {

      Salesman.findAll()
        .then(data => {

          console.log(data);
          vm.selectedSalesman = SalesmanAuth.getCurrentUser();

        });

    }

    function salesmanMenuTitle() {
      return vm.selectedSalesman ? vm.selectedSalesman : 'Выбрать салесмана';
    }

  }

  angular.module('webPage')
    .controller('NavbarMenuController', navbarMenuController);

})();
