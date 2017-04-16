'use strict';

(function (module) {

  module.component('debtCashingPopover', {

    bindings: {
      debt: '<'
    },

    transclude: true,

    templateUrl: 'app/domain/components/debtCashingPopover/debtCashingPopover.html',

    controller: debtCashingPopoverController,
    controllerAs: 'vm'

  });

  function debtCashingPopoverController(Schema, $timeout, $scope) {

    let vm = this;

    _.assign(vm, {

      cashings: [],
      deleteConfirmation:{},

      $onInit,
      cashWholeClick,
      triggerClick,
      deleteCashingClick,
      cashPartClick,
      onSubmit

    });

    const {Cashing} = Schema.models();

    /*
     Init
     */

    /*
     Listeners
     */

    /*
     Functions
     */

    function cashPartClick() {

      if (vm.cashPart) {
        doCashing(vm.cashed);
      }

      vm.cashPart = !vm.cashPart;
      vm.cashed = null;

    }

    function onSubmit() {
      cashPartClick();
    }

    function deleteCashingClick(cashing) {

      let confirmation = !vm.deleteConfirmation[cashing.id];

      vm.deleteConfirmation[cashing.id] = confirmation;

      if (confirmation) {
        return $timeout(2000)
          .then(() => vm.deleteConfirmation[cashing.id] = false);
      }

      cashing.DSDestroy()
        .then(() => {
          _.remove(vm.cashings, {id: cashing.id});
          $scope.$emit('DebtOrCashingModified');
        });
    }

    function triggerClick() {

      vm.isPopoverOpen = !vm.isPopoverOpen;

      if (!vm.isPopoverOpen) return;

      let debtId = _.get(vm.debt, 'id');

      if (!debtId) return;

      Cashing.findAll({debtId})
        .then(cashings => vm.cashings = cashings)
        .catch(e => console.error(e));

    }

    function doCashing(summ) {

      if (summ <= 0) return;

      let cashing = Cashing.createInstance({
        debtId: vm.debt.id,
        summ: summ,
        outletId: vm.debt.outletId,
        date: moment().format()
      });

      Cashing.create(cashing)
        .then(saved => {
          vm.cashings.push(saved);
          vm.isPopoverOpen = false;
          $scope.$emit('DebtOrCashingModified');
        });
    }

    function cashWholeClick() {
      doCashing(vm.debt.uncashed());
    }

    function $onInit() {
      $scope.$watch('vm.isPopoverOpen', () => {
        vm.cashPart = false;
        vm.cashed = null;
      });
    }

  }

})(angular.module('Sales'));
