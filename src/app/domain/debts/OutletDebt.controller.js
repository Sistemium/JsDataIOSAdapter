'use strict';

(function () {

  function OutletDebtController(Schema, $scope, saControllerHelper, $state) {

    const {Debt, Outlet, Cashing} = Schema.models();

    const vm = saControllerHelper
      .setup(this, $scope)
      .use({totalSumm});

    const {outletId} = $state.params;

    vm.setBusy(getData(outletId));

    Outlet.bindOne(outletId, $scope, 'vm.outlet');

    /*
     Functions
     */

    function getData(outletId) {

      // TODO: summ>0 in findAll filter

      return Debt.findAll({outletId})
        .then(data => vm.debts = _.filter(data, debt => debt.summ > 0))
        .then(data => {

          data = _.groupBy(data, 'date');
          vm.data = _.map(data, (items, date) => {
            return {date, items}
          });

          let cashingFilter = {outletId, uncashingId:null};

          Cashing.findAll(cashingFilter);

          vm.rebindAll(Cashing, cashingFilter, 'vm.cashings', () => {

            let cashingTotalByDebt = {};
            let cashingTotal = 0;

            _.each(vm.cashings, cashing => {
              let total = cashingTotalByDebt[cashing.debtId] || 0;
              total += cashing.summ;
              cashingTotalByDebt[cashing.debtId] = total;
              cashingTotal += cashing.summ;
            });

            vm.cashingTotalByDebt = cashingTotal ? cashingTotalByDebt : null;
            vm.cashingTotal = cashingTotal;

          });

        })
        .catch(e => console.error(e));

    }

    function totalSumm() {
      return _.sumBy(vm.debts, 'summ');
    }

  }

  angular.module('webPage')
    .controller('OutletDebtController', OutletDebtController);

}());
