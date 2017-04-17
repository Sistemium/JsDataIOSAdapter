'use strict';

(function (module) {

  module.component('uncashPopover', {

    bindings: {
      uncashed: '<'
    },

    transclude: true,

    templateUrl: 'app/domain/components/uncashPopover/uncashPopover.html',

    controller: uncashPopoverController,
    controllerAs: 'vm'

  });

  function uncashPopoverController(Schema, $scope, $q) {

    let vm = this;

    _.assign(vm, {

      $onInit,
      onSubmit,
      triggerClick

    });

    const {Uncashing} = Schema.models();

    /*
     Functions
     */

    function triggerClick() {

      vm.isPopoverOpen = !vm.isPopoverOpen;

    }

    function onSubmit() {

      // date: {type: 'date'},
      // summ: {type: 'decimal'},
      // summOrigin: {type: 'decimal'},
      // commentText: true,
      //   processing: true,
      //   type: true,
      //   deviceCts: {type: 'timestamp'},
      //
      // uncashingPlaceId

      let {type, commentText, uncashingPlace} = vm;

      let uncashing = Uncashing.createInstance({
        date: moment().format(),
        commentText,
        type,
        uncashingPlaceId: uncashingPlace.id
      });

      Uncashing.create(uncashing)
        .then(uncashing => {
          return $q.all(_.map(vm.uncashed, cashing => {
            cashing.uncashingId = uncashing.id;
            return cashing.DSSave();
          }))
        })
        .then(() => {
          vm.isPopoverOpen = false;
          $scope.$emit('DebtOrCashingModified');
        });
    }

    function $onInit() {

      $scope.$watch('vm.isPopoverOpen', isOpen => {

        if (!isOpen) return;

        _.assign(vm, {
          type: 'cashdesk',
          commentText: null,
          uncashingPlace: null,
          summ: _.sumBy(vm.uncashed, 'summ')
        });

      });

    }

  }

})(angular.module('Sales'));
