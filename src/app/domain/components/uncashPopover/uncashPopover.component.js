'use strict';

(function (module) {

  module.component('uncashPopover', {

    bindings: {
      uncashed: '<'
    },

    templateUrl: 'app/domain/components/uncashPopover/uncashPopover.html',

    controllerAs: 'vm'

  });

  module.component('uncashingForm', {

    bindings: {
      uncashed: '<',
      isPopoverOpen: '='
    },

    templateUrl: 'app/domain/components/uncashPopover/uncashingForm.html',

    controller: uncashingFormController,
    controllerAs: 'vm'

  });

  function uncashingFormController(Schema, $scope, $q, localStorageService, Sockets, Auth) {

    let vm = this;

    _.assign(vm, {

      $onInit,
      $onDestroy: saveDefaults,

      onSubmit,
      deletePhotoClick,
      totalSumm

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

      UncashingPicture.inject(data);

    }

    function deletePhotoClick() {
      if (vm.uncashingPicture.id) {
        UncashingPicture.destroy(vm.uncashingPicture)
          .then(() => {
            vm.uncashingPicture = UncashingPicture.createInstance({uncashingId: vm.uncashing.id});
          });
      }
    }


    function onSubmit() {

      let {uncashing} = vm;

      _.assign(uncashing, {
        date: moment().format(),
        summ: totalSumm(),
        summOrigin: _.sumBy(vm.uncashed, 'summ'),
        processing: 'upload'
      });

      Uncashing.create(uncashing)
        .then(uncashing => {
          return $q.all(_.map(vm.uncashed, cashing => {
            cashing.uncashingId = uncashing.id;
            // TODO: here could be useful PATCH method
            return cashing.DSSave();
          }))
        })
        .then(() => {
          vm.isPopoverOpen = false;
          $scope.$emit('DebtOrCashingModified');
        });
    }

    const DEFAULT_FIELDS = ['uncashingPlaceId', 'type'];

    function saveDefaults() {

      localStorageService.set('uncashing.defaults', _.pick(vm.uncashing, DEFAULT_FIELDS))

    }

    function totalSumm() {
      return _.sumBy(vm.uncashed, 'summ');
    }

    function $onInit() {

      let {authId} = Auth.getAccount();
      let processing = 'draft';

      Uncashing.findAll({authId, processing}, {limit: 1, bypassCache: true})
        .then(uncashings => {

          let draft = _.first(uncashings);

          if (draft) return draft;

          draft = Uncashing.createInstance({
            authId,
            processing: 'draft',
            type: 'cashdesk'
          });

          _.assign(draft, localStorageService.get('uncashing.defaults'));

          return Uncashing.create(draft);

        })
        .then(uncashing => Uncashing.loadRelations(uncashing))
        .then(uncashing => {

          let uncashingPicture = uncashing.picture || UncashingPicture.createInstance({uncashingId: uncashing.id});

          _.assign(vm, {uncashingPicture, uncashing});

          $scope.$watch('vm.uncashing.type', () => {
            Uncashing.save(vm.uncashing);
          });

        });
    }

  }

})(angular.module('Sales'));
