'use strict';

(function () {

  function DebtByOutletController(Schema, $scope, saControllerHelper, $state, $q, SalesmanAuth) {

    const vm = saControllerHelper
      .setup(this, $scope);

    const {Debt, Outlet, Cashing} = Schema.models();

    vm.use({

      itemClick,
      totalCashingSumm,
      totalSumm

    });

    SalesmanAuth.watchCurrent($scope, () => {
      let filter = SalesmanAuth.makeFilter();
      vm.setBusy(getData(filter));
    });

    /*
     Listeners
     */

    vm.onScope('rootClick', () => $state.go('sales.debtByOutlet'));

    /*
     Functions
     */

    function totalCashingSumm() {
      return _.sumBy(vm.data, 'sum(cashing.summ)');
    }

    function totalSumm() {
      return _.sumBy(vm.data, 'sum(summ)');
    }

    function itemClick(item) {
      let outletId = item.outletId;
      if (!outletId) return;
      $state.go('.outletDebt', {outletId});
    }

    function getData(filter) {

      return Debt.groupBy(filter, ['outletId'])
        .then(data => $q.all(_.map(data, loadDebtRelations)))
        .then(data => vm.data = _.filter(data, 'outlet'))
        .then(loadCashings)
        .catch(e => console.error(e));

    }

    function loadCashings(data) {

      return Cashing.groupBy({uncashingId: null}, ['outletId'])
        .then(cashingGrouped => {
          _.each(cashingGrouped, outletCashings => {
            let {outletId} = outletCashings;
            let item = _.find(data, {outletId});
            if (!item) return;
            item['sum(cashing.summ)'] = outletCashings['sum(summ)'];
          });
        });

    }

    function loadDebtRelations(item) {

      if (!item.outletId) return $q.resolve();

      return Outlet.find(item.outletId)
        .then(outlet => {
          item.outlet = outlet;
          return item;
        });

    }

  }

  angular.module('webPage')
    .controller('DebtByOutletController', DebtByOutletController);

}());
