'use strict';

(function (module) {

  module.component('outletCashingPopover', {

    bindings: {
      outlet: '<'
    },

    transclude: true,

    templateUrl: 'app/domain/components/outletCashingPopover/outletCashingPopover.html',

    controller: outletCashingPopoverController,
    controllerAs: 'vm'

  });

  function outletCashingPopoverController(Schema, $scope) {

    let vm = this;

    _.assign(vm, {

      $onInit,
      onSubmit,
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

    }

    function onSubmit() {

      let {summ, ndoc} = vm;

      if (summ <= 0 || !ndoc) return;

      let cashing = Cashing.createInstance({
        summ,
        ndoc,
        debtId: null,
        uncashingId: null,
        outletId: _.get(vm, 'outlet.id') || null,
        date: moment().format(),
        commentText: vm.commentText
      });

      Cashing.create(cashing)
        .then(() => {
          vm.isPopoverOpen = false;
          $scope.$emit('DebtOrCashingModified');
        });
    }

    function $onInit() {
      $scope.$watch('vm.isPopoverOpen', () => {
        vm.ndoc = null;
        vm.summ = null;
        vm.commentText = null;
      });
    }

  }

})(angular.module('Sales'));
