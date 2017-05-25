'use strict';

(function (module) {

  module.component('shipmentPointPhotoForm', {

    bindings: {
      onSubmitFn: '='
    },

    templateUrl: 'app/domain/components/makeShipmentPointPhoto/shipmentPointPhotoForm.html',

    controller: shipmentPointPhotoFormController,
    controllerAs: 'vm'

  });

  function shipmentPointPhotoFormController(Schema, $scope, localStorageService, Sockets, SalesmanAuth, Helpers) {

    const {saControllerHelper, ClickHelper, moment} = Helpers;

    let vm = saControllerHelper.setup(this, $scope)
      .use(ClickHelper);

    _.assign(vm, {

      shipmentRoutePointPhoto: null,

      $onInit,
      $onDestroy: saveDefaults,

      // deletePhotoClick,
      onSubmit,
      chooseShipmentPointClick

    });

    const {ShipmentRoutePointPhoto, ShipmentRoutePoint} = Schema.models();

    $scope.$on('$destroy', Sockets.onJsData('jsData:update', onJSData));

    /*
     Functions
     */

    function chooseShipmentPointClick(shipmentPoint) {
      if (shipmentPoint) {
        vm.shipmentRoutePointPhoto.shipmentRoutePoint = shipmentPoint;
      }
      vm.listShown = vm.showShipmentRoutePointList = !vm.showShipmentRoutePointList;
    }

    function onJSData(event) {

      if (event.resource !== 'PhotoReport') return;

      let {data} = event;

      if (!_.get(data, 'href')) return;

      ShipmentRoutePointPhoto.inject(data);

    }

    // function deletePhotoClick() {
    //   if (vm.photoReport.id) {
    //     PhotoReport.destroy(vm.photoReport)
    //       .then(() => {
    //         initEmpty();
    //       });
    //   }
    // }
    //

    function onSubmit() {

      let {shipmentRoutePointPhoto} = vm;
      vm.onSubmitFn(shipmentRoutePointPhoto);

    }

    const DEFAULT_FIELDS = ['shipmentRoutePointId'];
    const LOCAL_STORAGE_KEY = 'shipmentPointPhotoForm.defaults';

    function saveDefaults() {
      localStorageService.set(LOCAL_STORAGE_KEY, _.pick(vm.shipmentRoutePointPhoto, DEFAULT_FIELDS));
    }

    function $onInit() {

      ShipmentRoutePoint.findAll()
        .then(data => vm.shipmentRoutePoints = data);

      if (!vm.id) {
        return initEmpty();
      }

      ShipmentRoutePointPhoto.find({id: vm.id}, {bypassCache: true})
        .then(shipmentRoutePointPhoto => vm.shipmentRoutePointPhoto = shipmentRoutePointPhoto)
        .then(shipmentRoutePointPhoto => ShipmentRoutePointPhoto.loadRelations(shipmentRoutePointPhoto))
        .catch(err => {

          if (err.status === 404) {
            initEmpty();
          }

        });

    }

    function initEmpty() {
      let draft = ShipmentRoutePointPhoto.createInstance({
        processing: 'draft'
      });

      _.assign(draft, localStorageService.get(LOCAL_STORAGE_KEY));

      vm.shipmentRoutePointPhoto = draft;
    }

  }

})(angular.module('Sales'));
