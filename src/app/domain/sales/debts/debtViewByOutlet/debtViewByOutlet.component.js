'use strict';

(function (module) {

  module.component('debtViewByOutlet', {

    bindings: {
      customFilter: '<',
      disableElements: '<'
    },

    templateUrl: 'app/domain/sales/debts/debtViewByOutlet/debtViewByOutlet.html',
    controller: debtViewByOutletController,
    controllerAs: 'vm'

  });

  function debtViewByOutletController($scope, $timeout, $filter, $state,
                                      Schema, saControllerHelper,
                                      ShipmentModal
  ) {

    const { Debt, Outlet, Cashing, Responsibility } = Schema.models();

    const vm = saControllerHelper.setup(this, $scope)
      .use({

        toSummCashingInProgress: false,
        copyingInProgress: false,
        busy: true,
        currentState: 'outletDebt',

        inCheckingProgress,

        confirmation: {},
        checkedDebts: {},
        unsavedCashings: [],
        trashUndebtedClick,
        totalCashedClick,
        debtClick,
        textFromDebt,
        checkedDebtsTotal

      });

    const outletId = _.get($state.params, 'outletId') || vm.customFilter;
    const dateFilter = $filter('date');
    const numberFilter = $filter('number');

    vm.setBusy(getData(outletId));

    Outlet.bindOne(outletId, $scope, 'vm.outlet');

    vm.watchScope('vm.toSummCashingInProgress', clearChecks);

    vm.watchScope('vm.copyingInProgress', clearChecks);

    /*
     Functions
     */

    function clearChecks() {
      vm.checkedDebts = {};
    }

    function totalCashedClick() {
      $state.go('sales.cashing');
    }

    function debtClick(debt, event) {

      if (event.defaultPrevented) return;

      event.preventDefault();

      if (!inCheckingProgress()) {

        let { documentId } = debt;

        return documentId && ShipmentModal.show(documentId);

      }

      let checked = vm.checkedDebts[debt.id];

      if (checked) {
        delete vm.checkedDebts[debt.id];
      } else {
        vm.checkedDebts[debt.id] = debt;
      }

    }

    function checkedDebtsTotal() {
      return _.sumBy(_.filter(vm.checkedDebts), 'summ');
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
        outletId: { '==': outletId }
      }, responsibility);

      return Debt.findAll({ where }, { bypassCache: true })
        .then(data => vm.debts = _.filter(data, debt => debt.summ || debt.summDoc))
        .then(data => {

          data = _.groupBy(data, 'date');
          data = _.map(data, (items, date) => {
            return { date, items }
          });

          return Cashing.findAll({ outletId, isProcessed: false }, { bypassCache: true })
            .then(() => {
              vm.rebindAll(Cashing, { outletId, uncashingId: null }, 'vm.cashings', updateCashingTotals);
            })
            .then(() => vm.rawData = data);

        })
        .then(() => {

          vm.busy = false;

          vm.totals = {
            totalSumm: totalSumm(),
            totalSummDoc: totalSummDoc(),
            totalSummDocPlus: totalSummDoc() - totalSumm()
          };
        })
        .catch(e => console.error(e));

    }

    function updateFilters(data) {
      vm.data = _.filter(data, date => {
        return _.find(date.items, debt => {
          return Math.abs(debt.summ) >= 0.01 || vm.cashingTotalByDebt && vm.cashingTotalByDebt[debt.id];
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

      vm.undebtedCashings = _.filter(vm.cashings, { debtId: null });

      vm.cashingTotalByDebt = cashingTotal ? cashingTotalByDebt : null;
      vm.cashingTotal = cashingTotal;

      updateFilters(vm.rawData);

    }

    function totalSumm() {
      return _.sumBy(vm.debts, debt => debt.uncashed());
    }

    function totalSummDoc() {
      return _.sumBy(vm.debts, debt => debt.summDoc);
    }

    function inCheckingProgress() {
      return vm.copyingInProgress || vm.toSummCashingInProgress;
    }

    function textFromDebt(debt) {
      return `${debt.ndoc} от ${dateFilter(debt.date)} (${numberFilter(debt.summOriginDoc || debt.summOrigin, 2)} ₽)` +
        ` остаток долга: ${numberFilter(debt.summ, 2)} ₽`;
    }

  }

})(angular.module('Sales'));
