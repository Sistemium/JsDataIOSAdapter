'use strict';

(function () {

  function navbarMenuController(saControllerHelper, Schema, IOS, $scope) {

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

      Salesman.findAll()
        .then(salesmans => {

          vm.salesmans = _.sortBy(salesmans, 'name');
          console.log(vm.salesmans);

        });

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

    function salesmanClick(salesman) {

      if (_.isObject(salesman)) {

        vm.selectedSalesman = (vm.selectedSalesman !== salesman) ? salesman : undefined;

      }

    }

    function salesmanMenuTitle() {
      return vm.selectedSalesman ? vm.selectedSalesman.shortName : 'Выбрать салесмана';
    }

  }

  angular.module('webPage')
    .controller('NavbarMenuController', navbarMenuController);

})();
