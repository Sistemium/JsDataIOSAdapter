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

  function debtCashingPopoverController(Schema) {

    let vm = this;

    _.assign(vm, {

      cashings: [],

      $onInit,
      cashWholeClick,
      triggerClick

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
      Cashing.inject(cashing);
      vm.cashings.push(cashing);
    }

    function $onInit() {

    }

  }

})(angular.module('Sales'));
