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

  function toSummCashingController($q, $scope, Schema) {

    let {Cashing} = Schema.models();

    const vm = _.assign(this, {

      $onDestroy: cancelClick,

      onSubmit,
      triggerClick,
      cancelClick,
      summRemains,
      isReady

    });

    /*
     Functions
     */

    function cancelClick() {
      unbindUnsaved();
      vm.inProgress = false;
      _.each(vm.cashings, cashing => cashing.DSEject());
      vm.cashings = [];
      vm.summ = null;
    }

    function isReady() {
      return vm.inProgress && !summRemains();
    }

    let unbindUnsaved = _.noop;

    function onSubmit() {

      if (!vm.inProgress) {
        unbindUnsaved();
        unbindUnsaved = $scope.$watch(() => Cashing.lastModified(), setCashings);
      }

      vm.inProgress = true;
      vm.popoverOpen = false;

    }

    function setCashings() {
      let outletCashings = Cashing.filter({outletId: vm.outlet.id});
      vm.cashings = _.filter(outletCashings, cashing => !cashing.DSLastSaved());
    }

    function summRemains() {
      return vm.summ - (_.sumBy(vm.cashings, 'summ') || 0);
    }

    function triggerClick() {

      if (vm.isReady()) {

        $q.all(_.map(vm.cashings, cashing => cashing.DSCreate()))
          .then(() => {
            unbindUnsaved();
            vm.popoverOpen = false;
            vm.inProgress = false;
            vm.cashings = [];
            vm.summ = null;
          });

        return;

      }

      vm.popoverOpen = !vm.popoverOpen;

    }

  }

})(angular.module('Sales'));
