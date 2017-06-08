'use strict';

(function () {

  function ShipmentRoutes(Schema, Helpers, $scope, $state, SalesmanAuth) {

    const {ShipmentRoute} = Schema.models();
    const {saControllerHelper} = Helpers;

    const vm = saControllerHelper.setup(this, $scope)
      .use({
        selectRoute
      });

    let filter = SalesmanAuth.makeFilter();

    let options = {limit: 10, orderBy: [['date', 'DESC']]};

    let q = [
      ShipmentRoute.findAllWithRelations(filter, options)('ShipmentRoutePoint').then(routes => vm.data = routes)
    ];
    vm.setBusy(q);

    function selectRoute(route) {
      $state.go('shipping.points', {routeId: route.id});
    }

  }

  angular.module('webPage')
    .controller('ShipmentRoutes', ShipmentRoutes);

}());
