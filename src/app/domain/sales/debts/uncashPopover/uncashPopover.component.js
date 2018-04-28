'use strict';

(function (module) {

  module.component('uncashPopover', {

    bindings: {
      uncashed: '=',
      isPopoverOpen: '=',
      cgBusy: '=busy'
    },

    templateUrl: 'app/domain/sales/debts/uncashPopover/uncashPopover.html',

    controllerAs: 'vm'

  });

  module.component('uncashingForm', {

    bindings: {
      uncashed: '=',
      isPopoverOpen: '='
    },

    templateUrl: 'app/domain/sales/debts/uncashPopover/uncashingForm.html',

    controller: uncashingFormController,
    controllerAs: 'vm'

  });

  function uncashingFormController(Schema, $scope, $q, localStorageService, Sockets, Auth, toastr) {

    let vm = this;

    _.assign(vm, {

      $onInit,
      $onDestroy: saveDefaults,

      onSubmit,
      deletePhotoClick,
      totalSumm

    });

    const {Uncashing, UncashingPicture, UncashingPlace} = Schema.models();

    $scope.$on('$destroy', Sockets.onJsData('jsData:update', onJSData));

    $scope.$on('$destroy', $scope.$watch('vm.busySavingPhoto', onBusySavingPhoto));

    /*
     Functions
     */

    function onBusySavingPhoto(promise) {
      if (promise && promise.then) {
        vm.cgBusy = promise;
      }
    }

    function onJSData(event) {

      if (event.resource !== 'UncashingPicture') return;

      let {data} = event;

      if (!_.get(data, 'href')) return;

      UncashingPicture.inject(data);

    }

    function deletePhotoClick() {

      let {id} = vm.uncashingPicture;

      vm.uncashingPicture = UncashingPicture.createInstance({uncashingId: vm.uncashing.id});

      if (id) {
        vm.cgBusy = UncashingPicture.destroy(id);
      }

    }


    function onSubmit() {

      let {uncashing} = vm;
      let uncashed = _.clone(vm.uncashed);

      if (!uncashing || !uncashed || !uncashed.length) {
        return toastr.error('Ошибка сохранения выручки', 'Повторите попытку');
      }

      if (uncashing.type === 'bank' && !vm.uncashingPicture.id) {
        return toastr.error('Ошибка сохранения выручки', 'Отсутсвует фотография чека');
      }

      let {authId} = Auth.getAccount();

      _.assign(uncashing, {
        date: moment().format(),
        summ: totalSumm(),
        summOrigin: _.sumBy(uncashed, 'summ'),
        processing: 'upload',
        authId
      });

      vm.cgBusy = Uncashing.create(uncashing)
        .then(uncashing => {
          return $q.all(_.map(uncashed, cashing => {
            cashing.uncashingId = uncashing.id;
            return cashing.DSCreate();
          }))
        })
        .then(() => {
          vm.isPopoverOpen = false;
          $scope.$emit('DebtOrCashingModified');
        });
    }

    const DEFAULT_FIELDS = ['uncashingPlaceId', 'type'];

    function saveDefaults() {

      if (!vm.uncashing) {
        return;
      }

      localStorageService.set('uncashing.defaults', _.pick(vm.uncashing, DEFAULT_FIELDS))

    }

    function totalSumm() {
      return _.sumBy(vm.uncashed, 'summ');
    }

    function $onInit() {

      let {authId} = Auth.getAccount();
      let processing = 'draft';

      vm.cgBusy = Uncashing.findAll({authId, processing}, {limit: 1, bypassCache: true})
        .then(uncashings => {

          let draft = _.first(uncashings);

          return UncashingPlace.findAll()
            .then(() => {

              draft = draft || Uncashing.createInstance({
                authId,
                processing: 'draft',
                type: 'cashdesk'
              });

              _.assign(draft, localStorageService.get('uncashing.defaults'));

              let {uncashingPlaceId} = draft;

              if (uncashingPlaceId && !UncashingPlace.get(uncashingPlaceId)) {
                draft.uncashingPlaceId = null;
              }

              if (!draft.id || draft.DSHasChanges()) {
                return Uncashing.create(draft);
              }

              return draft;

            });


        })
        .then(uncashing => uncashing.DSLoadRelations('UncashingPicture'))
        .then(uncashing => {

          let uncashingPicture = uncashing.picture || UncashingPicture.createInstance({uncashingId: uncashing.id});

          _.assign(vm, {uncashingPicture, uncashing});

          $scope.$on('$destroy', $scope.$watch('vm.uncashing.type', (oldType, newType) => {
            if (oldType !== newType) {
              Uncashing.save(vm.uncashing);
            }
          }));

        });
    }

  }

})(angular.module('Sales'));
