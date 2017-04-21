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

  function uncashPopoverController(Schema, $scope, $q, localStorageService, Sockets) {

    let vm = this;

    _.assign(vm, {

      $onInit,
      $onDestroy,

      onSubmit,
      triggerClick,
      deletePhotoClick

    });

    const {Uncashing, UncashingPicture} = Schema.models();

    $scope.$on('$destroy', Sockets.onJsData('jsData:update', onJSData));

    /*
     Functions
     */

    function onJSData(event) {

      if (event.resource !== 'UncashingPicture') return;

      let {data} = event;

      if (!_.get(data, 'href')) return;

      // FIXME: IOS can't upload picture with null uncashingId thus we never reach here
      
      UncashingPicture.inject(data);

    }

    function deletePhotoClick() {
      vm.photoFile = null;
      vm.uncashingPicture = UncashingPicture.createInstance();
    }

    function triggerClick() {

      vm.isPopoverOpen = !vm.isPopoverOpen;

    }

    function onSubmit() {

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

            let q = $q.resolve(vm.uncashingPicture);

            if (vm.uncashingPicture.id) {
              // FIXME: ugly because in simulator we don't get href updates and may override it
              // UncashingPicture can't be uploaded with null uncashingId
              q = UncashingPicture.find(vm.uncashingPicture.id);
            }

            return q.then(picture => {
              picture.uncashingId = uncashing.id;
              return UncashingPicture.create(picture)
                .then(() => uncashing);
            })

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
