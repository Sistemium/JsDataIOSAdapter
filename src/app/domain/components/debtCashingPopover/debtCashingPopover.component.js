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
      deleteCashingClick

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

    function cashWholeClick() {

      if (vm.debt.summ <= 0) return;

      let cashing = Cashing.createInstance({
        debtId: vm.debt.id,
        summ: vm.debt.summ,
        outletId: vm.debt.outletId
      });

      Cashing.create(cashing)
        .then(saved => {
          vm.cashings.push(saved);
          vm.isPopoverOpen = false;
          $scope.$emit('DebtOrCashingModified');
        });

    }

    function $onInit() {

    }

  }

})(angular.module('Sales'));
