'use strict';

(function () {

  function ShipmentPointInfo(Schema, Helpers, $scope, GalleryHelper, $state) {

    const {ShipmentRoutePointPhoto, ShipmentRoutePoint, ShipmentRoutePointShipment} = Schema.models();
    const {saControllerHelper} = Helpers;

    const vm = saControllerHelper.setup(this, $scope)
      .use(GalleryHelper)
      .use({

        routePointId: $state.params.routePointId,

        thumbClick,
        goBack

      });

    if (!vm.routePointId) {
      $state.go('shipping.routes');
    }

    // let filter = {shipmentRoutePointId: vm.routePointId};
    // ffb32924-3a4f-11e7-8000-a94bf6924c85 0 shipments
    // ffab8804-3a4f-11e7-8000-a94bf6924c85

    // ShipmentRoutePointShipment.findAll({shipmentRoutePointId: 'ffab8804-3a4f-11e7-8000-a94bf6924c85'}).then(res => {
    //   console.info(res);
    // });

    let q = [
      ShipmentRoutePoint.find(vm.routePointId).then(point => vm.routePoint = point)
    ];
    vm.setBusy(q);

    // vm.rebindAll(Shipment, {orderBy: [['deviceCts', 'DESC']]}, 'vm.shipments');
    // vm.rebindAll(ShipmentRoutePointPhoto, {orderBy: [['deviceCts', 'DESC']]}, 'vm.photos');

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

    function goBack() {
      $state.go('shipping.points', {routeId: vm.routePoint.shipmentRouteId});
    }

  }

  angular.module('webPage')
    .controller('ShipmentPointInfo', ShipmentPointInfo);

}());
