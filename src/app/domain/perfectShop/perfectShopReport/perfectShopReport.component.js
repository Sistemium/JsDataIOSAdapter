(function () {

  const URL = 'app/domain/perfectShop/perfectShopReport';

  angular.module('Sales')
    .component('perfectShopReport', {

      bindings: {
        salesmanId: '<',
      },

      templateUrl: `${URL}/perfectShopReport.html`,
      controller: perfectShopReportController,
      controllerAs: 'vm'

    });

  /** @ngInject */
  function perfectShopReportController(saControllerHelper, $state, $scope, SalesmanAuth, SalesService) {

    const vm = saControllerHelper.setup(this, $scope)
      .use({
        outletClick(stat) {
          const { id: statId } = stat;
          $state.go('sales.perfectShopReport.outletPerfectShop', { statId });
        },
        $onInit() {
          SalesService.loadCampaignGroups(this)
            .then(() => {
              SalesmanAuth.watchCurrent($scope, refresh);
              vm.watchScope('vm.campaignGroupId', () => {
                refresh(SalesmanAuth.getCurrentUser());
              });
            })
        },
      });

    function refresh(salesman) {

      const { dateB, dateE } = _.find(vm.campaignGroups, { id: vm.campaignGroupId });

      const busy = SalesService.findOutletStats(salesman, dateB, dateE)
        .then(data => {
          _.assign(vm, {
            data,
            dateB,
            dateE,
          });
        });

      vm.setBusy(busy);

    }

  }

})();
