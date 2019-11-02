(function (module) {

  module.component('possibleOutletTasks', {

    bindings: {},

    controller: possibleOutletTasksController,

    templateUrl: 'app/domain/sales/possibleOutlets/possibleOutletTasks.html',
    controllerAs: 'vm'

  });

  function possibleOutletTasksController(saControllerHelper, $scope, SalesService, SalesmanAuth) {

    const vm = saControllerHelper.setup(this, $scope)
      .use({
        $onInit() {
          SalesmanAuth.watchCurrent($scope, onSalesman);
        },
        outletClick(outlet) {
          $scope.$emit('possible-outlet-click', outlet.id);
        },
      });

    function onSalesman(salesmanId) {
      // vm.rebindAll()
      SalesService.findAllPossibleOutlets(salesmanId)
        .then(data => {
          vm.outlets = data;
        });
    }


  }

})(angular.module('Sales'));
