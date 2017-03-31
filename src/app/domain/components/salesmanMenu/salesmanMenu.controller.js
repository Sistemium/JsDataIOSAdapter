'use strict';

(function () {

  function salesmanMenuController(saControllerHelper, $scope, SalesmanAuth, saMedia) {

    let vm = saControllerHelper.setup(this, $scope);

    vm.use({

      salesmen: null,
      isEnabled: false,
      salesmanClick,
      noneClick: SalesmanAuth.logout,
      toggleLabel,
      isOpen: false

    });

    SalesmanAuth
      .bindAll($scope, 'vm.salesmen', onDataChange)
      .watchCurrent($scope, salesman => vm.selectedSalesman = salesman);

    /*
     Functions
     */

    function toggleLabel() {
      if (vm.selectedSalesman) {
        return saMedia.xxsWidth ? vm.selectedSalesman.initials : vm.selectedSalesman.tinyName;
      }
      return saMedia.xxsWidth ? false : 'Выберите ТП';
    }

    function salesmanClick(salesman) {

      vm.isOpen = false;

      if (!salesman || _.get(vm, 'selectedSalesman.id') === salesman.id) {
        return SalesmanAuth.logout();
      }

      SalesmanAuth.login(salesman);

    }

    function onDataChange(e, data) {
      vm.isEnabled = _.get(data, 'length') > 1;
      vm.hasOptions = _.get(data, 'length') > 1;
    }

  }

  angular.module('Sales')
    .controller('SalesmanMenuController', salesmanMenuController);

})();
