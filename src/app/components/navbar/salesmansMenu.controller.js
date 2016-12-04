'use strict';

(function () {

  function salesmansMenuController(saControllerHelper, $scope, SalesmanAuth) {

    let vm = saControllerHelper.setup(this, $scope);

    vm.use({
      salesmanClick: SalesmanAuth.login,
      onStateChange
    });

    SalesmanAuth
      .bindAll($scope, 'vm.salesmans')
      .watchCurrent($scope, salesman => vm.selectedSalesman = salesman);

    /*
    Functions
     */

    function onStateChange(state) {
      vm.isSalesState = _.startsWith(state.name, 'sales.');
    }

  }

  angular.module('webPage')
    .controller('SalesmansMenuController', salesmansMenuController);

})();
