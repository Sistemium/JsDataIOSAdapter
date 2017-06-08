'use strict';

(function () {

  function ShipmentPoints(Schema, Helpers, $scope, $state) {

    const {ShipmentRoutePoint} = Schema.models();
    const {saControllerHelper} = Helpers;

    const vm = saControllerHelper.setup(this, $scope)
      .use({
        selectPoint,
        goBack
      });

    if (!$state.params.routeId) {
      goBack();
    }

    let filter = {shipmentRouteId: $state.params.routeId};

    let q = [
      ShipmentRoutePoint.findAllWithRelations(filter)(['ShipmentRoutePointPhoto', 'Shipment']).then(points => vm.data = points)
    ];
    vm.setBusy(q);

    function selectPoint(point) {
      $state.go('shipping.pointInfo', {routePointId: point.id});
    }

    function goBack() {
      $state.go('shipping.routes');
    }

  }

  angular.module('webPage')
    .controller('ShipmentPoints', ShipmentPoints);

}());
