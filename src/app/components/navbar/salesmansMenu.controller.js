'use strict';

(function () {

  function salesmansMenuController(saControllerHelper, Schema, $scope, $window, $rootScope, $state) {

    var vm = saControllerHelper.setup(this, $scope);

    vm.use({
      salesmanClick
    });

    var {Salesman} = Schema.models();
    var selectedSalesmanIdKey = 'selectedSalesmanId';

    checkState($state.current.name);

    $scope.$on('$stateChangeSuccess', (e, to) => {

      checkState(to.name);
      _.isUndefined(vm.salesmans) && findSalesmans();

    });

    function checkState(stateName) {
      vm.isSalesState = _.startsWith(stateName, 'sales.');
    }

    function findSalesmans() {

      Salesman.findAll()
        .then(salesmans => {

          vm.salesmans = _.sortBy(salesmans, 'name');
          checkSalesmanSelection();

        });

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

      $rootScope.$broadcast('selectedSalesmanChanged');

    }

    function checkSalesmanSelection() {

      if (vm.salesmans.length === 1) {
        selectSalesman(_.first(vm.salesmans));
      } else {

        var selectedSalesmanId = $window.localStorage.getItem(selectedSalesmanIdKey);

        if (selectedSalesmanId) {

          var selectedSalesman = _.find(vm.salesmans, {'id': selectedSalesmanId});
          selectedSalesman && selectSalesman(selectedSalesman);

        }

      }

    }

  }

  angular.module('webPage')
    .controller('SalesmansMenuController', salesmansMenuController);

})();
