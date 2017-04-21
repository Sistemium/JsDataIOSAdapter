'use strict';

(function (module) {

  module.component('uncashPopover', {

    bindings: {
      uncashed: '<'
    },

    // transclude: true,

    templateUrl: 'app/domain/components/uncashPopover/uncashPopover.html',

    controller: uncashPopoverController,
    controllerAs: 'vm'

  });

  function uncashPopoverController(Schema, $scope, $q, localStorageService) {

    let vm = this;

    _.assign(vm, {

      $onInit,
      $onDestroy,

      onSubmit,
      triggerClick

    });

    const {Uncashing, UncashingPicture} = Schema.models();

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
        summ: _.sumBy(vm.uncashed, 'summ'),
        summOrigin: _.sumBy(vm.uncashed, 'summ'),
        processing: 'upload',
        commentText,
        type,
        uncashingPlaceId: type === 'cashdesk' ? uncashingPlace.id : null
      });

      Uncashing.create(uncashing)
        .then(uncashing => {

          if (type === 'bank') {
            let picture = _.assign(vm.uncashingPicture, {uncashingId: uncashing.id});
            return UncashingPicture.create(picture)
              .then(() => uncashing);
          }

          return uncashing;

        })
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

    const DEFAULT_FIELDS = ['uncashingPlaceId', 'type'];

    function $onDestroy() {

      vm.uncashingPlaceId = _.get(vm, 'uncashingPlace.id');
      localStorageService.set('uncashing.defaults', _.pick(vm, DEFAULT_FIELDS))

    }

    function $onInit() {

      _.assign(vm, {

        type: 'cashdesk',
        commentText: null,
        summ: _.sumBy(vm.uncashed, 'summ'),
        uncashingPicture: UncashingPicture.createInstance()

      });

      _.assign(vm, localStorageService.get('uncashing.defaults'));

    }

  }

})(angular.module('Sales'));
