(function (module) {

  module.component('possibleOutletTasks', {

    bindings: {},

    controller: possibleOutletTasksController,

    templateUrl: 'app/domain/sales/possibleOutlets/possibleOutletTasks.html',
    controllerAs: 'vm'

  });

  function possibleOutletTasksController(saControllerHelper, $scope, PhotoHelper,
                                         SalesService, SalesmanAuth, Sockets) {

    const vm = saControllerHelper.setup(this, $scope)
      .use({
        $onInit() {
          SalesmanAuth.watchCurrent($scope, onSalesman);
          $scope.$on('$destroy', Sockets.jsDataSubscribe(['PossibleOutletPhoto']));
          $scope.$on('$destroy', Sockets.onJsData('jsData:update', this.onJSData));
        },
        outletClick(outlet) {
          $scope.$emit('possible-outlet-click', outlet.id);
        },
        onJSData: PhotoHelper.onJSData('PossibleOutletPhoto'),
      });

    function onSalesman(salesmanId) {
      // vm.rebindAll()
      const busy = SalesService.findAllPossibleOutlets(salesmanId)
        .then(data => {
          vm.outlets = data;
        });
      vm.setBusy(busy);
    }


  }

})(angular.module('Sales'));
