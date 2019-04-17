(function () {

  angular.module('Sales')
    .component('salesTargetsReport', {

      bindings: {
        // outletId: '<',
      },

      templateUrl: 'app/domain/sales/mustStock/salesTargetsReport/salesTargetsReport.html',

      controller: salesTargetsReportController,
      controllerAs: 'vm'

    });


  function salesTargetsReportController($scope, Helpers, SalesTargetingService, SalesmanAuth) {

    const { saControllerHelper } = Helpers;

    const vm = saControllerHelper.setup(this, $scope);

    vm.use({
      $onInit,
    });

    /*
    Functions
     */

    function $onInit() {
      SalesmanAuth.watchCurrent($scope, refresh);
    }

    function refresh(salesman) {

      if (!salesman) {
        return;
      }

      const q = SalesTargetingService.refreshTargeting()
        .then(() => SalesTargetingService.salesmanShipmentsData(salesman.id))
        .then(data => {
          vm.outletsCnt = _.keys(data).length;
          vm.data = SalesTargetingService.salesmanTargetsReport(data);
        });

      vm.setBusy(q);

    }



  }

})();
