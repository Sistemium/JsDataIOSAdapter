'use strict';

(function () {

  function OutletDebtController(Schema, $scope, saControllerHelper, $state, $timeout) {

    const {Debt, Outlet, Cashing} = Schema.models();

    const vm = saControllerHelper
      .setup(this, $scope)
      .use({
        totalSumm,
        trashUndebtedClick,
        confirmation: {}
      });

    const {outletId} = $state.params;

    vm.setBusy(getData(outletId));

    Outlet.bindOne(outletId, $scope, 'vm.outlet');

    /*
     Functions
     */

    function trashUndebtedClick(cashing) {
      if ((vm.confirmation[cashing.id] = !vm.confirmation[cashing.id])) {
        return $timeout(2000).then(() => vm.confirmation[cashing.id] = false);
      }
      Cashing.destroy(cashing);
    }

    function getData(outletId) {

      // TODO: summ>0 in findAll filter

      return Debt.findAll({outletId})
        .then(data => vm.debts = _.filter(data, debt => debt.summ > 0))
        .then(data => {

          data = _.groupBy(data, 'date');
          data = _.map(data, (items, date) => {
            return {date, items}
          });

          return Cashing.findAll({outletId, isProcessed: false})
            .then(() => {
              vm.rebindAll(Cashing, {outletId, uncashingId: null}, 'vm.cashings', () => {

                let cashingTotalByDebt = {};
                let cashingTotal = 0;

                _.each(vm.cashings, cashing => {
                  let total = cashingTotalByDebt[cashing.debtId] || 0;
                  total += cashing.summ;
                  cashingTotalByDebt[cashing.debtId] = total;
                  cashingTotal += cashing.summ;
                });

                vm.undebtedCashings = _.filter(vm.cashings, {debtId: null});

                vm.cashingTotalByDebt = cashingTotal ? cashingTotalByDebt : null;
                vm.cashingTotal = cashingTotal;

              });
            })
            .then(() => data);

        })
        .then(data => {
          vm.data = _.filter(data, date => {
            return _.find(date.items, debt => {
              return Math.abs(debt.uncashed()) > 0.01 || vm.cashingTotalByDebt && vm.cashingTotalByDebt[debt.id];
            })
          });
        })
        .catch(e => console.error(e));

    }

    function totalSumm() {
      return _.sumBy(vm.debts, debt => debt.uncashed());
    }

  }

  angular.module('webPage')
    .controller('OutletDebtController', OutletDebtController);

}());
