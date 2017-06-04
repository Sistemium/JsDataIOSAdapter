'use strict';

(function () {

  function ShipmentPointInfo(Schema, Helpers, $scope, GalleryHelper, $state) {

    const {Shipment, ShipmentRoutePointPhoto} = Schema.models();
    const {saControllerHelper} = Helpers;

    const vm = saControllerHelper.setup(this, $scope)
      .use(GalleryHelper)
      .use({

        routePointId: $state.params.routePointId,

        thumbClick

      });

    if (!$state.params.routePointId) {
      $state.go('shipping.routes');
    }

    let filter = {shipmentRoutePointId: $state.params.routePointId};

    let q = [
      ShipmentRoutePointPhoto.findAllWithRelations(filter, {bypassCache: true})(['ShipmentRoutePoint'])
    ];
    vm.setBusy(q);

    vm.rebindAll(ShipmentRoutePointPhoto, {orderBy: [['deviceCts', 'DESC']]}, 'vm.data');

    $scope.$on('$destroy', $scope.$watch('vm.data', initEmptyPhoto));

    function initEmptyPhoto() {

      vm.shipmentRoutePointPhoto = ShipmentRoutePointPhoto.createInstance({
        processing: 'draft',
        shipmentRoutePointId: vm.routePointId
      });

    }

    function thumbClick(picture) {

      vm.commentText = picture.shipmentRoutePoint.name;
      $scope.imagesAll = vm.data;

      return vm.thumbnailClick(picture);

    }

  }

  angular.module('webPage')
    .controller('ShipmentPointInfo', ShipmentPointInfo);

}());
