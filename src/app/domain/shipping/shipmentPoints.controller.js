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

    const routeId = $state.params.routeId;

    if (!routeId) {
      goBack();
    }

    let filter = {shipmentRouteId: routeId};

    let q = [
      ShipmentRoutePoint.findAllWithRelations(filter)(['ShipmentRoutePointPhoto']).then(points => vm.data = points)
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
