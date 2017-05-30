'use strict';

(function () {

  function DebtByOutletController(Schema, $scope, saControllerHelper, $state, $q, SalesmanAuth) {

    const {Debt, Outlet, Cashing, Partner} = Schema.models();

    const vm = saControllerHelper
      .setup(this, $scope)
      .use({

        itemClick,
        totalCashed,
        totalSumm,
        onStateChange,
        totalCashedClick

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

    function totalCashedClick() {
      $state.go('sales.cashing');
    }

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

    function totalCashed(data) {
      return _.sumBy(data || vm.data, 'sum(cashed)');
    }

    function totalSumm(data) {
      return _.sumBy(data || vm.data, 'sum(summ)');
    }

    function itemClick(item) {
      let outletId = item.outletId;
      if (!outletId) return;
      $state.go('.outletDebt', {outletId});
    }

    function getData(filter) {

      return Outlet.findAll(Outlet.meta.salesmanFilter(filter))
        .then(outlets => {

          let outletById = _.groupBy(outlets, 'id');

          return Debt.groupBy({}, ['outletId'])
            .then(debtsByOutlet => {
              return _.filter(debtsByOutlet, debt => outletById[debt.outletId]);
            });

        })
        .then(data => $q.all(_.map(data, loadDebtRelations)))
        .then(data => _.filter(data, 'outlet'))
        .then(loadNotProcessed)
        .then(loadCashed)
        .then(groupByPartner)
        .catch(e => console.error(e));

    }

    function groupByPartner(data) {

      let byPartnerId = _.groupBy(data, 'outlet.partnerId');

      vm.data = _.map(byPartnerId, (items, partnerId) => {
        return {
          partner: Partner.get(partnerId),
          items,
          'sum(cashed)': totalCashed(items),
          'sum(summ)': totalSumm(items)
        }
      });

      vm.data = _.orderBy(vm.data, 'partner.name');

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

      return Cashing.findAll(SalesmanAuth.makeFilter({isProcessed: false}))
        .then(cashings => {
          cashings = _.filter(cashings, 'debtId');
          return _.groupBy(cashings, 'outletId');
        })
      // FIXME: copy-pasted
        .then(cashingGrouped => {
          _.each(cashingGrouped, (outletCashings, outletId) => {
            let item = _.find(data, {outletId});
            if (!item) return;
            item['sum(summ)'] -= _.sumBy(outletCashings, 'summ');
          });
          return data;
        });

    }

    function loadDebtRelations(item) {

      if (!item.outletId) return $q.resolve();

      return Outlet.find(item.outletId)
        .then(outlet => {
          item.outlet = outlet;
          return outlet.DSLoadRelations('Partner');
        })
        .then(() => item);

    }

  }

  angular.module('webPage')
    .controller('DebtByOutletController', DebtByOutletController);

}());
