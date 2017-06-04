'use strict';

(function () {

  function ShipmentPointInfo(Schema, Helpers, $scope, GalleryHelper, $state) {

    const {Shipment, ShipmentRoutePointPhoto, ShipmentRoutePoint} = Schema.models();
    const {saControllerHelper} = Helpers;

    const vm = saControllerHelper.setup(this, $scope)
      .use(GalleryHelper)
      .use({

        routePointId: $state.params.routePointId,

        thumbClick

      });

    if (!vm.routePointId) {
      $state.go('shipping.routes');
    }

    // let filter = {shipmentRoutePointId: vm.routePointId};

    let q = [
      ShipmentRoutePoint.loadRelations(vm.routePointId, ['Shipment', 'ShipmentRoutePointPhoto'])
      // ,
      // ShipmentRoutePointPhoto.findAllWithRelations(filter, {bypassCache: true})(['ShipmentRoutePoint'])
    ];
    vm.setBusy(q);

    vm.rebindAll(Shipment, {orderBy: [['deviceCts', 'DESC']]}, 'vm.shipments');
    vm.rebindAll(ShipmentRoutePointPhoto, {orderBy: [['deviceCts', 'DESC']]}, 'vm.photos');

    $scope.$on('$destroy', $scope.$watch('vm.photos', initEmptyPhoto));

    function initEmptyPhoto() {

      vm.shipmentRoutePointPhoto = ShipmentRoutePointPhoto.createInstance({
        processing: 'draft',
        shipmentRoutePointId: vm.routePointId
      });

    }

    function thumbClick(picture) {

      vm.commentText = picture.shipmentRoutePoint.name;
      $scope.imagesAll = vm.photos;

      return vm.thumbnailClick(picture);

    }

  }

  angular.module('webPage')
    .controller('ShipmentPointInfo', ShipmentPointInfo);

}());
