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

      console.log('show salesmans list to select one');
      Salesman.findAll()
        .then(data => {
          console.log(data)
        });

      //var salesman = SalesmanAuth.getCurrentUser();
      //
      //if (salesman) {
      //  vm.selectedSalesman = salesman;
      //}

    }

    function salesmanMenuTitle() {
      return vm.selectedSalesman ? vm.selectedSalesman : 'Выбрать салесмана';
    }

  }

  angular.module('webPage')
    .controller('NavbarMenuController', navbarMenuController);

})();
