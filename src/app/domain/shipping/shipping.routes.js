'use strict';

(function () {

  angular.module('webPage')
    .config(function (stateHelperProvider) {

      stateHelperProvider
        .state({

          name: 'shipping',
          abstract: true,
          templateUrl: 'app/domain/ui-view.html'

        })
      ;

      stateHelperProvider
        .state({

          url: '/shipmentRoutes',
          name: 'shipping.routes',
          templateUrl: 'app/domain/shipping/shipmentRoutes.html',
          controller: 'ShipmentRoutes as vm'

        })
      ;

      stateHelperProvider
        .state({

          url: '/shipmentPoints?routeId',
          name: 'shipping.points',
          templateUrl: 'app/domain/shipping/shipmentPoints.html',
          controller: 'ShipmentPoints as vm'

        })
      ;

      stateHelperProvider
        .state({

          url: '/shippingphotos?routePointId',
          name: 'shipping.pointInfo',
          templateUrl: 'app/domain/shipping/shipmentPointInfo.html',
          controller: 'ShipmentPointInfo as vm'

        })
      ;

    });

})();
