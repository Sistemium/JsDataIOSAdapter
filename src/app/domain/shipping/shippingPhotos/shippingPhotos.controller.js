'use strict';

(function () {

  function ShippingPhotos(Schema, Helpers, $scope, GalleryHelper, $state) {

    const {ShipmentRoute, ShipmentRoutePoint, ShipmentRoutePointPhoto} = Schema.models();
    const {saControllerHelper} = Helpers;

    const vm = saControllerHelper.setup(this, $scope)
      .use(GalleryHelper)
      .use({

        shipmentRoutePointPhoto: undefined,

        routeId: $state.params.routeId,
        routePointId: $state.params.routePointId,

        selectRoute,
        selectPoint,
        thumbClick

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
        ShipmentRoutePointPhoto.findAllWithRelations(
          {shipmentRoutePointId: routePointId},
          {bypassCache: true}
        )(['ShipmentRoutePoint'])
      ];
      vm.setBusy(q);

      vm.rebindAll(ShipmentRoutePointPhoto, {orderBy: [['deviceCts', 'DESC']]}, 'vm.data');

      $scope.$on('$destroy', $scope.$watch('vm.data', initEmptyPhoto));

    }

    function initEmptyPhoto() {

      let draft = ShipmentRoutePointPhoto.createInstance({
        processing: 'draft',
        shipmentRoutePointId: vm.routePointId
      });
      vm.shipmentRoutePointPhoto = draft;

    }

    function thumbClick(picture) {

      vm.commentText = picture.shipmentRoutePoint.name;
      $scope.imagesAll = vm.data;

      return vm.thumbnailClick(picture);

    }

  }

  angular.module('webPage')
    .controller('ShippingPhotos', ShippingPhotos);

}());
