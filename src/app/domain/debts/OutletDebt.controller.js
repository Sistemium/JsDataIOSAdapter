'use strict';

(function () {

  function OutletDebtController(Schema, $scope, saControllerHelper, $state, $timeout, toastr, SalesmanAuth) {

    const {Debt, Outlet, Cashing, Responsibility} = Schema.models();

    const vm = saControllerHelper
      .setup(this, $scope)
      .use({
        toSummCashingInProgress: false,
        totalSumm,
        trashUndebtedClick,
        confirmation: {},
        debtClick,
        unsavedCashings: []
      });

    const {outletId} = $state.params;

    vm.setBusy(getData(outletId));

    Outlet.bindOne(outletId, $scope, 'vm.outlet');

    vm.watchScope('vm.toSummCashingInProgress', clearChecks);

    /*
     Functions
     */

    function clearChecks() {
      _.each(vm.data, group => {
        _.each(group.items, item => {
          item.checked = false;
        });
      });
    }

    function debtClick(debt, event) {

      if (event.defaultPrevented || !vm.summToCash) return;

      event.preventDefault();

      let uncashed = debt.uncashed();
      let toCashRemains= vm.summToCash - (_.sumBy(vm.unsavedCashings, 'summ') || 0);
      let summ = _.min([vm.summToCash && toCashRemains, uncashed]);

      if (!toCashRemains && !debt.checked) {
        return toastr.error('Нажмите "Готово", чтобы завершить подбор', 'Сумма уже подобрана');
      }

      if (uncashed > 0 && summ > 0) {

        debt.checked = true;

        Cashing.inject({
          summ,
          debtId: debt.id,
          outletId: debt.outletId,
          date: moment().format()
        });

      } else {

        debt.checked = false;

        let cashings = Cashing.filter({debtId: debt.id});

        _.each(cashings, cashing => {
          if (!cashing.DSLastSaved()) {
            Cashing.eject(cashing);
          }
        });

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

      return Debt.findAll({outletId, where: responsibility})
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

})();
