'use strict';

(function () {

  function ShipmentPoints(Schema, Helpers, $scope, $state) {

    const {ShipmentRoutePoint} = Schema.models();
    const {saControllerHelper} = Helpers;

    const vm = saControllerHelper.setup(this, $scope)
      .use({
        selectPoint
      });

    if (!$state.params.routeId) {
      $state.go('shipping.routes');
    }

    let filter = {shipmentRouteId: $state.params.routeId};

    let q = [
      ShipmentRoutePoint.findAllWithRelations(filter)('ShipmentRoutePointPhoto').then(points => vm.data = points)
    ];
    vm.setBusy(q);

    function selectPoint(point) {
      $state.go('.', {routeId: vm.routeId, routePointId: point.id});
    }

  }

  angular.module('webPage')
    .controller('ShipmentPoints', ShipmentPoints);

}());
