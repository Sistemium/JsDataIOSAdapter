'use strict';

(function () {

  angular.module('webPage')
    .config(function (stateHelperProvider) {

      let routes = {

        url: '/shipmentRoutes',
        name: 'routes',
        templateUrl: 'app/domain/shipping/shipmentRoutes.html',
        controller: 'ShipmentRoutes as vm'

      };

      let points = {

        url: '/shipmentPoints?routeId',
        name: 'points',
        templateUrl: 'app/domain/shipping/shipmentPoints.html',
        controller: 'ShipmentPoints as vm'

      };

      let photos = {

        url: '/shipmentPhotos?routePointId',
        name: 'pointInfo',
        templateUrl: 'app/domain/shipping/shipmentPointInfo.html',
        controller: 'ShipmentPointInfo as vm'

      };

      stateHelperProvider
        .state({

          name: 'shipping',
          abstract: true,
          templateUrl: 'app/domain/ui-view.html',

          data: {
            title: 'Доставка'
          },

          children: [routes, points, photos]

        })
      ;
      
    });

})();
