'use strict';

(function () {

  function OutletDebtController(Schema, $scope, saControllerHelper, $state, $timeout) {

    const {Debt, Outlet, Cashing} = Schema.models();

    const vm = saControllerHelper
      .setup(this, $scope)
      .use({
        totalSumm,
        addUndebtedClick,
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

    function addUndebtedClick() {
      let cashing = Cashing.createInstance({
        outletId,
        summ: 999,
        ndoc: 'test',
        uncashingId: null,
        debtId: null
      });
      Cashing.inject(cashing);
    }

    function getData(outletId) {

      // TODO: summ>0 in findAll filter

      return Debt.findAll({outletId})
        .then(data => vm.debts = _.filter(data, debt => debt.summ > 0))
        .then(data => {

          data = _.groupBy(data, 'date');
          vm.data = _.map(data, (items, date) => {
            return {date, items}
          });

          let cashingFilter = {outletId, uncashingId: null};

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

            vm.undebtedCashings = _.filter(vm.cashings, {debtId: null});

            vm.cashingTotalByDebt = cashingTotal ? cashingTotalByDebt : null;
            vm.cashingTotal = cashingTotal;

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
