'use strict';

(function (module) {

  module.component('toSummCashing', {

    bindings: {
      outlet: '<',
      popoverOpen: '=?',
      inProgress: '=?',
      cashings: '=',
      summ: '=?'
    },

    templateUrl: 'app/domain/components/toSummCashing/toSummCashing.html',

    controller: toSummCashingController,
    controllerAs: 'vm'

  });

  function toSummCashingController($q, $scope) {

    let vm = this;

    _.assign(vm, {

      onSubmit,
      triggerClick,
      cancelClick,
      $onInit,
      summRemains,
      isReady

    });

    /*
     Functions
     */

    function cancelClick() {
      vm.inProgress = false;
      _.each(vm.cashings, cashing => cashing.DSEject());
      vm.cashings = [];
      vm.summ = null;
    }

    function isReady() {
      return vm.inProgress && !summRemains();
    }

    function onSubmit() {
      vm.inProgress = true;
      vm.popoverOpen = false;
    }

    function summRemains() {
      return vm.summ - (_.sumBy(vm.cashings, 'summ') || 0);
    }

    function triggerClick() {

      if (vm.isReady()) {

        $q.all(_.map(vm.cashings, cashing => cashing.DSCreate()))
          .then(() => {
            vm.popoverOpen = false;
            vm.inProgress = false;
            vm.cashings = [];
            vm.summ = null;
          });

        return;

      }

      vm.popoverOpen = !vm.popoverOpen;

      if (!vm.isPopoverOpen) return;

    }

    function $onInit() {
      $scope.$watch('vm.isPopoverOpen', () => {
      });
    }

  }

})(angular.module('Sales'));
