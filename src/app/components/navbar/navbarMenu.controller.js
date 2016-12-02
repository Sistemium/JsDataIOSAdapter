'use strict';

(function () {

  function navbarMenuController(saControllerHelper, Schema, IOS, $scope, $window) {

    var vm = saControllerHelper.setup(this, $scope);

    vm.use({

      fullscreenButtonClass,
      fullscreenButtonTitle,
      salesmanClick

    });

    var {Salesman} = Schema.models();
    var selectedSalesmanIdKey = 'selectedSalesmanId';

    toggleFullScreen();

    $scope.$on('$stateChangeSuccess', (e, to) => {

      vm.hideNavs = !!_.get(to, 'data.hideNavs');
      vm.isRootState = (to.name === 'home');
      vm.isSalesState = _.startsWith(to.name, 'sales.');

      vm.showMenu = vm.isSalesState || (vm.isRootState && vm.toggleFullScreen);

      Salesman.findAll()
        .then(salesmans => {

          vm.salesmans = _.sortBy(salesmans, 'name');
          checkSelectedSalesman();

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
      if (_.isObject(salesman)) selectSalesman(salesman);
    }

    function selectSalesman(salesman) {

      vm.selectedSalesman = (vm.selectedSalesman !== salesman) ? salesman : undefined;

      if (vm.selectedSalesman) {
        $window.localStorage.setItem(selectedSalesmanIdKey, vm.selectedSalesman.id);
      } else {
        $window.localStorage.removeItem(selectedSalesmanIdKey);
      }

    }

    function checkSelectedSalesman() {

      if (vm.salesmans.length === 1) {
        selectSalesman(_.first(vm.salesmans));
      } else {

        var selectedSalesmanId = $window.localStorage.getItem(selectedSalesmanIdKey);

        if (selectedSalesmanId) {

          var selectedSalesman = _.find(vm.salesmans, {'id': selectedSalesmanId});
          if (selectedSalesman) selectSalesman(selectedSalesman);

        }

      }

    }

  }

  angular.module('webPage')
    .controller('NavbarMenuController', navbarMenuController);

})();
