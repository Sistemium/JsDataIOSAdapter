'use strict';

(function () {

  function ShippingPhotos(Schema, Helpers, $scope, GalleryHelper/*, Sockets*/) {

    const {ShipmentRoute, ShipmentRoutePoint, ShipmentRoutePointPhoto} = Schema.models();
    const {saControllerHelper/*, toastr*/} = Helpers;

    const vm = saControllerHelper.setup(this, $scope)
      .use(GalleryHelper)
      .use({

        selectedRoute: undefined,
        selectedRoutePoint: undefined,

        selectRoute

      });

    refresh();

    /*
     Functions
     */

    function refresh() {

      if (vm.selectedRoutePoint) return findPhotos();
      if (vm.selectedRoute) return findPoints();
      findRoute();

    }

    function findRoute() {

      let q = [
        ShipmentRoute.findAllWithRelations({limit: 10})('ShipmentRoutePoint').then(routes => vm.data = routes)
      ];
      vm.setBusy(q);

    }

    function selectRoute(route) {
      vm.selectedRoute = route;
    }

    function findPoints(route) {

    }

    function findPhotos(routePoint) {

    }

  }

  angular.module('webPage')
    .controller('ShippingPhotos', ShippingPhotos);

}());
