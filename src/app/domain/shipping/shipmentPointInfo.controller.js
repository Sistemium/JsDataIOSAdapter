'use strict';

(function () {

  function ShipmentPointInfo(Schema, Helpers, $scope, GalleryHelper, $state) {

    const {ShipmentRoutePointPhoto, ShipmentRoutePoint, ShipmentRoutePointShipment, Shipment} = Schema.models();
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

    let shipmentFilter = {shipmentRoutePointId: vm.routePointId};

    let q = [
      ShipmentRoutePoint.find(vm.routePointId).then(point => {

        vm.routePoint = point;
        return ShipmentRoutePoint.loadRelations(point.id, ['ShipmentRoutePointPhoto']);

      }),
      ShipmentRoutePointShipment.findAllWithRelations(shipmentFilter)('Shipment').then(shipments => {

        let shipmentIds = _.map(shipments, shipment => {
          return shipment.shipmentId;
        });

        let shipmentFilter = {
          where: {
            id: {
              'in': shipmentIds
            }
          }
        };

        vm.shipments = Shipment.filter(shipmentFilter);

      })
    ];
    vm.setBusy(q);

    let photoFilter = {shipmentRoutePointId: vm.routePointId, orderBy: [['deviceCts', 'DESC']]};
    vm.rebindAll(ShipmentRoutePointPhoto, photoFilter, 'vm.photos');

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
