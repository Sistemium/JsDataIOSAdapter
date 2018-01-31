'use strict';

(function (module) {

  module.component('toSummCashing', {

    bindings: {
      outlet: '<',
      popoverOpen: '=?',
      inProgress: '=?',
      debts: '=',
      summ: '=?'
    },

    templateUrl: 'app/domain/sales/debts/toSummCashing/toSummCashing.html',

    controller: toSummCashingController,
    controllerAs: 'vm'

  });

  function toSummCashingController($q, $scope, Schema, toastr, moment) {

    let {Cashing} = Schema.models();

    const vm = _.assign(this, {

      $onDestroy: cancelClick,

      onSubmit,
      triggerClick,
      cancelClick,
      summRemains,
      isReady

    });

    const cashings = [];

    /*
     Functions
     */

    function onDebtChecked() {

      _.remove(cashings, cashing => {

        if (vm.debts[cashing.debtId]) {
          return false;
        }

        if (!cashing.DSLastSaved()) {
          Cashing.eject(cashing);
        }

        return true;

      });

      let notCashed = _.filter(vm.debts, debt => !_.find(cashings, {debtId: debt.id}));

      _.each(notCashed, debt => {

        let uncashed = debt.uncashed();
        let toCashRemains = vm.summ - (_.sumBy(cashings, 'summ') || 0);
        let summ = _.min([vm.summ && toCashRemains, uncashed]);

        if (!uncashed) {
          delete vm.debts[debt.id];
          return;
        }

        if (!toCashRemains) {
          delete vm.debts[debt.id];
          toastr.error('Нажмите "Готово", чтобы завершить подбор', 'Сумма уже подобрана');
          return false;
        }

        let cashing = Cashing.inject({
          summ,
          debtId: debt.id,
          outletId: debt.outletId,
          date: moment().format()
        });

        cashings.push(cashing);

      });

    }

    function cancelClick() {

      unwatchDebts();

      _.remove(cashings, cashing => {
        cashing.DSEject();
        return true;
      });

      vm.inProgress = false;
      vm.summ = null;

    }

    function isReady() {
      return vm.inProgress && !summRemains();
    }

    let unwatchDebts = _.noop;

    function onSubmit() {

      if (!vm.inProgress) {
        unwatchDebts();
      }

      vm.inProgress = true;
      vm.popoverOpen = false;

      unwatchDebts = $scope.$watchCollection('vm.debts', onDebtChecked);

    }

    function summRemains() {
      return vm.summ - (_.sumBy(cashings, 'summ') || 0);
    }

    function triggerClick() {

      if (vm.isReady()) {

        $q.all(_.map(cashings, cashing => cashing.DSCreate()))
          .then(() => {

            vm.popoverOpen = false;
            vm.inProgress = false;
            _.remove(cashings);
            vm.summ = null;

          });


        unwatchDebts();

        return;

      }

      vm.popoverOpen = !vm.popoverOpen;

    }

  }

})(angular.module('Sales'));
