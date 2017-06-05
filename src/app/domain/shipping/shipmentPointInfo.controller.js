'use strict';

(function () {

  function ShipmentPointInfo(Schema, Helpers, $scope, GalleryHelper, $state, $q) {

    const {ShipmentRoutePointPhoto, ShipmentRoutePoint, ShipmentRoutePointShipment, Shipment} = Schema.models();
    const {saControllerHelper} = Helpers;

    const vm = saControllerHelper.setup(this, $scope)
      .use(GalleryHelper)
      .use({

        routePointId: $state.params.routePointId,

        thumbClick,
        goBack,
        confirmArrival,
        doneShipping

      });

    if (!vm.routePointId) {
      $state.go('shipping.routes');
    }

    let findPointPromise = ShipmentRoutePoint.find(vm.routePointId).then(point => {

      vm.routePoint = point;
      return ShipmentRoutePoint.loadRelations(point.id, ['ShipmentRoutePointPhoto']);

    });

    let loadPositionsPromise = $q.all(_.map(vm.shipments, shipment => {
      return Shipment.loadRelations(shipment.id, ['ShipmentPosition']).then(shipmentWithRelations => {
        // console.info(shipmentWithRelations);
        // have no position — need to check it later
      });
    }));

    let shipmentFilter = {shipmentRoutePointId: vm.routePointId};
    let findPointShipmentPromise = ShipmentRoutePointShipment.findAllWithRelations(shipmentFilter)('Shipment').then(shipments => {

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

      return loadPositionsPromise;

    });

    let q = [
      findPointPromise,
      findPointShipmentPromise
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

    function confirmArrival() {

      // have to get Location and set ShipmentRoutePoint.reachedAtLocationId
      console.info('confirmArrival');

    }

    function doneShipping() {

      // have to set all shipments shipment.isShipped = YES
      console.info('doneShipping');

    }

  }

  angular.module('webPage')
    .controller('ShipmentPointInfo', ShipmentPointInfo);

}());
