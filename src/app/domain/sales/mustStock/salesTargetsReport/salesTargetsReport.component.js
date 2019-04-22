(function () {

  angular.module('Sales')
    .component('salesTargetsReport', {

      bindings: {
        articleGroupId: '=',
      },

      templateUrl: 'app/domain/sales/mustStock/salesTargetsReport/salesTargetsReport.html',

      controller: salesTargetsReportController,
      controllerAs: 'vm'

    });


  function salesTargetsReportController($scope, Helpers, SalesTargetingService,
                                        SalesmanAuth, SalesService) {

    const { saControllerHelper } = Helpers;

    const vm = saControllerHelper.setup(this, $scope);

    vm.use({
      $onInit,
      articleGroups: [],
      datePeriods: [],
    });

    /*
    Functions
     */

    function $onInit() {
      this.datePeriods = SalesTargetingService.datePeriods();
      this.datePeriod = _.get(SalesTargetingService.defaultPeriod(), 'id');
      SalesmanAuth.watchCurrent($scope, refresh);
      vm.watchScope('vm.articleGroupId', onArticleGroup);
      vm.watchScope('vm.datePeriod', onDatePeriod);
    }

    function onDatePeriod() {
      if (vm.busy) return;
      refresh(SalesmanAuth.getCurrentUser());
    }

    function onArticleGroup(articleGroupId) {
      vm.targetGroups = SalesTargetingService.targetsByArticleGroup(articleGroupId);
    }

    function refresh(salesman) {

      if (!salesman || !vm.datePeriod) {
        return;
      }

      const period = _.find(vm.datePeriods, { id: vm.datePeriod });
      const { dateB, dateE } = period;

      const q = SalesTargetingService.refreshTargeting()
        .then(() => SalesService.findAllSalesmanOutlets(salesman.id))
        .then(() => {
          vm.articleGroups = SalesTargetingService.targetingArticleGroups();
        })
        .then(() =>
          SalesTargetingService.salesmanShipmentsData(salesman.id, dateB, dateE))
        .then(data => {
          vm.outletsCnt = _.keys(data).length;
          vm.data = SalesTargetingService.salesmanTargetsReport(data);
          vm.outletsData = SalesTargetingService.salesmanArticleGroupReport(data);
          if (vm.articleGroupId) {
            onArticleGroup(vm.articleGroupId);
          }
        })
        .catch(e => {
          console.error(e);
        });

      vm.setBusy(q);

    }


  }

})();
