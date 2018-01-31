'use strict';

(function (module) {

  module.component('debtCashingPopover', {

    bindings: {
      debt: '<',
      doNotSave: '<'
    },

    transclude: true,

    templateUrl: 'app/domain/components/debtCashingPopover/debtCashingPopover.html',

    controller: debtCashingPopoverController,
    controllerAs: 'vm'

  });

  function debtCashingPopoverController(Schema, $timeout, $scope, $q) {

    let vm = this;

    _.assign(vm, {

      cashings: [],
      deleteConfirmation: {},

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

    function cashWholeClick() {
      doCashing(vm.debt.uncashed());
    }

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

      let q = cashing.DSLastSaved() ? Cashing.destroy(cashing) : $q.resolve(Cashing.eject(cashing));

      q.then(() => {
        _.remove(vm.cashings, {id: cashing.id});
        $scope.$emit('DebtOrCashingModified');
        vm.isPopoverOpen = false;
      });

    }

    function triggerClick(event) {

      event.preventDefault();

      vm.isPopoverOpen = !vm.isPopoverOpen;

      if (!vm.isPopoverOpen) return;

      let debtId = _.get(vm.debt, 'id');

      if (!debtId) return;

      Cashing.findAll({debtId})
        .then(() => vm.cashings = Cashing.filter({debtId}))
        .catch(e => console.error(e));

    }

    function doCashing(summ) {

      if (summ <= 0) return;

      let cashing = Cashing.createInstance({
        debtId: vm.debt.id,
        summ: summ,
        outletId: vm.debt.outletId,
        date: moment().format(),
        commentText: vm.commentText || null,
        isProcessed: false
      });

      let q = vm.doNotSave ? $q.resolve(Cashing.inject(cashing)) : Cashing.create(cashing);

      q.then(saved => {
        vm.cashings.push(saved);
        vm.isPopoverOpen = false;
        vm.commentText = '';
        $scope.$emit('DebtOrCashingModified');
      });

    }

    function $onInit() {
      $scope.$watch('vm.isPopoverOpen', () => {
        vm.cashPart = false;
        vm.cashed = null;
      });
    }

  }

})(angular.module('Sales'));
