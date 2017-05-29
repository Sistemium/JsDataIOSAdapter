'use strict';

(function () {

  angular.module('Models').run(function (Schema) {

    Schema.register({

      name: 'ShipmentRoutePoint',

      relations: {
        hasOne: {
          ShipmentRoute: {
            localField: 'shipmentRoute',
            localKey: 'shipmentRouteId'
          }
        },
        hasMany: {
          ShipmentRoutePointPhoto: {
            localField: 'photos',
            foreignKey: 'shipmentRoutePointId'
          }
        }
      }

    });

  });

})();
