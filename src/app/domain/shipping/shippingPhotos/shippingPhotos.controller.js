'use strict';

(function () {

  function ShippingPhotos(Schema, Helpers, $scope, GalleryHelper, $state) {

    const {ShipmentRoute, ShipmentRoutePoint, ShipmentRoutePointPhoto} = Schema.models();
    const {saControllerHelper} = Helpers;

    const vm = saControllerHelper.setup(this, $scope)
      .use(GalleryHelper)
      .use({

        routeId: $state.params.routeId,
        routePointId: $state.params.routePointId,

        selectRoute,
        selectPoint

      });

    refresh();

    /*
     Functions
     */

    function refresh() {

      if (vm.routePointId) return findPhotos(vm.routePointId);
      if (vm.routeId) return findPoints(vm.routeId);
      findRoute();

    }

    function findRoute() {

      // TODO: nave to filter ShipmentRoutes by current driverId

      let q = [
        ShipmentRoute.findAllWithRelations({limit: 10})('ShipmentRoutePoint').then(routes => vm.data = routes)
      ];
      vm.setBusy(q);

    }

    function selectRoute(route) {
      $state.go('.', {routeId: route.id, routePointId: undefined});
    }

    // $state.go('.', {outletId: outlet.id, campaignId: null});

    function findPoints(routeId) {

      let q = [
        ShipmentRoutePoint.findAll({shipmentRouteId: routeId}).then(points => vm.data = points)
      ];
      vm.setBusy(q);

    }

    function selectPoint(point) {
      $state.go('.', {routeId: vm.routeId, routePointId: point.id});
    }

    function findPhotos(routePointId) {

      let q = [
        ShipmentRoutePointPhoto.findAll({shipmentRoutePointId: routePointId}).then(photos => vm.data = photos)
      ];
      vm.setBusy(q);

    }

  }

  angular.module('webPage')
    .controller('ShippingPhotos', ShippingPhotos);

}());
