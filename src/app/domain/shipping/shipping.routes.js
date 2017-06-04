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

          url: '/shippingphotos?routeId&routePointId',
          name: 'shipping.photos',
          templateUrl: 'app/domain/shipping/shippingPhotos/shippingPhotos.html',
          controller: 'ShippingPhotos as vm'

        })
      ;

    });

})();
