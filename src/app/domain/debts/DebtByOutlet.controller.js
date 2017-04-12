'use strict';

(function () {

  function DebtByOutletController(Schema, $scope, saControllerHelper, $state, $q, SalesmanAuth) {

    const {Debt, Outlet, Cashing} = Schema.models();

    const vm = saControllerHelper
      .setup(this, $scope)
      .use({

        itemClick,
        totalCashed,
        totalSumm,
        onStateChange

      });

    const rootState = 'sales.debtByOutlet';

    /*
     Listeners
     */

    SalesmanAuth.watchCurrent($scope, refresh);
    vm.onScope('rootClick', () => $state.go(rootState));
    vm.onScope('DebtOrCashingModified', () => vm.wasModified = true);

    /*
     Functions
     */

    function onStateChange(to) {
      if (to.name === rootState && vm.wasModified) {
        refresh();
      }
    }

    function refresh() {
      let filter = SalesmanAuth.makeFilter();
      vm.setBusy(getData(filter))
        .then(() => vm.wasModified = false);
    }

    function totalCashed() {
      return _.sumBy(vm.data, 'sum(cashed)');
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
        .then(data => {
          return Outlet.findAll(Outlet.meta.salesmanFilter(filter))
            .then(() => data)
        })
        .then(data => $q.all(_.map(data, loadDebtRelations)))
        .then(data => _.filter(data, 'outlet'))
        .then(loadNotProcessed)
        .then(loadCashed)
        .then(data => vm.data = data)
        .catch(e => console.error(e));

    }

    function loadCashed(data) {

      return Cashing.groupBy(SalesmanAuth.makeFilter({uncashingId: null}), ['outletId'])
        .then(cashingGrouped => {
          _.each(cashingGrouped, outletCashings => {
            let {outletId} = outletCashings;
            let item = _.find(data, {outletId});
            if (!item) return;
            item['sum(cashed)'] = outletCashings['sum(summ)'];
          });
          return data;
        });

    }

    function loadNotProcessed(data) {

      return Cashing.groupBy(SalesmanAuth.makeFilter({isProcessed: false}), ['outletId'])
      // FIXME: copy-pasted
        .then(cashingGrouped => {
          _.each(cashingGrouped, outletCashings => {
            let {outletId} = outletCashings;
            let item = _.find(data, {outletId});
            if (!item) return;
            item['sum(summ)'] -= outletCashings['sum(summ)'];
          });
          return data;
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
