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
      return _.sumBy(vm.data, 'totalCashingSumm');
    }

    function totalSumm() {
      return _.sumBy(vm.data, 'total');
    }

    function itemClick(item) {
      let outletId = item.outletId;
      if (!outletId) return;
      $state.go('.outletDebt', {outletId});
    }

    function getData(filter) {

      return Debt.groupBy(filter, ['outletId'])
        .then(data => $q.all(_.map(data, loadGroupRelations)))
        .then(data => vm.data = _.filter(data, 'outlet'))
        .then(data => loadCashingsByOutlet()
          .then(cashingsByOutlet => {
            _.each(cashingsByOutlet, (outletCashings, outletId) => {
              let item = _.find(data, {outletId});
              if (!item) return;
              item.cashings = outletCashings;
              item.totalCashingSumm = _.sumBy(outletCashings, 'summ');
              console.log(item);
            });
          }))
        .catch(e => console.error(e));

    }

    function loadCashingsByOutlet() {
      return Cashing.findAll({uncashingId:null})
        .then(cashings => _.groupBy(cashings, 'outletId'));
    }

    function loadGroupRelations(item) {

      if (!item.outletId) return $q.resolve();

      return Outlet.find(item.outletId)
        .then(outlet => {
          return Debt.findAll({outletId: outlet.id})
            .then(debts => {
              item.total = _.round(_.sumBy(debts, 'summ'), 2);
              return outlet;
            })
        })
        .then(outlet => {
          item.outlet = outlet;
          return item;
        });

    }

  }

  angular.module('webPage')
    .controller('DebtByOutletController', DebtByOutletController);

}());
