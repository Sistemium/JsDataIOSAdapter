'use strict';

(function () {

  angular.module('Models').run(function (Schema) {

    Schema.register({

      name: 'ShipmentRoutePointPhoto',

      relations: {
        hasOne: {
          ShipmentRoutePoint: {
            localField: 'shipmentRoutePoint',
            localKey: 'shipmentRoutePointId'
          }
        }
      }

    });

  });

})();
