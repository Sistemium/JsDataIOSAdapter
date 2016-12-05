'use strict';

(function () {

  function salesmansMenuController(saControllerHelper, $scope, SalesmanAuth) {

    let vm = saControllerHelper.setup(this, $scope);

    vm.use({
      isEnabled: false,
      salesmanClick: SalesmanAuth.login,
      noneClick: SalesmanAuth.logout,
      onStateChange
    });

    SalesmanAuth
      .bindAll($scope, 'vm.salesmans', onDataChange)
      .watchCurrent($scope, salesman => vm.selectedSalesman = salesman);

    /*
    Functions
     */

    function onStateChange(state) {
      vm.isSalesState = _.startsWith(state.name, 'sales.');
    }

    function onDataChange(e, data) {
      vm.isEnabled = _.get(data, 'length') > 1;
    }

  }

  angular.module('webPage')
    .controller('SalesmansMenuController', salesmansMenuController);

})();
