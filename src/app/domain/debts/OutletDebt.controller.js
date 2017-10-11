'use strict';

(function () {

  function OutletDebtController(Schema, $scope, saControllerHelper, $state, $timeout) {

    const {Debt, Outlet, Cashing, Responsibility} = Schema.models();

    const vm = saControllerHelper
      .setup(this, $scope)
      .use({
        toSummCashingInProgress: false,
        totalSumm,
        totalSummDoc,
        trashUndebtedClick,
        confirmation: {},
        debtClick,
        unsavedCashings: [],
        checkedDebts: {}
      });

    const {outletId} = $state.params;

    vm.setBusy(getData(outletId));

    Outlet.bindOne(outletId, $scope, 'vm.outlet');

    vm.watchScope('vm.toSummCashingInProgress', clearChecks);

    /*
     Functions
     */

    function clearChecks() {
      vm.checkedDebts = {};
    }

    function debtClick(debt, event) {

      if (event.defaultPrevented) return;

      event.preventDefault();


      let checked = vm.checkedDebts[debt.id];

      if (checked) {
        delete vm.checkedDebts[debt.id];
      } else {
        vm.checkedDebts[debt.id] = debt;
      }

    }

    function trashUndebtedClick(cashing) {
      if ((vm.confirmation[cashing.id] = !vm.confirmation[cashing.id])) {
        return $timeout(2000).then(() => vm.confirmation[cashing.id] = false);
      }
      Cashing.destroy(cashing);
    }

    function getData(outletId) {

      // TODO: summ>0 in findAll filter

      let responsibility = Responsibility.meta.jsdFilter();

      if (!responsibility) {
        vm.data = [];
        return;
      }

      let where = _.assign({
        outletId: {'==': outletId}
      }, responsibility);

      return Debt.findAll({where})
        .then(data => vm.debts = _.filter(data, debt => debt.summ > 0))
        .then(data => {

          data = _.groupBy(data, 'date');
          data = _.map(data, (items, date) => {
            return {date, items}
          });

          return Cashing.findAll({outletId, isProcessed: false})
            .then(() => {
              vm.rebindAll(Cashing, {outletId, uncashingId: null}, 'vm.cashings', updateCashingTotals);
            })
            .then(() => vm.rawData = data);

        })
        .catch(e => console.error(e));

    }

    function updateFilters(data) {
      vm.data = _.filter(data, date => {
        return _.find(date.items, debt => {
          return Math.abs(debt.uncashed()) > 0.01 || vm.cashingTotalByDebt && vm.cashingTotalByDebt[debt.id];
        })
      });
    }

    function updateCashingTotals() {

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

      updateFilters(vm.rawData);

    }

    function totalSumm() {
      return _.sumBy(vm.debts, debt => debt.uncashed());
    }

    function totalSummDoc() {
      return _.sumBy(vm.debts, debt => debt.summDoc - debt.summ);
    }

  }

  angular.module('webPage')
    .controller('OutletDebtController', OutletDebtController);

})();
