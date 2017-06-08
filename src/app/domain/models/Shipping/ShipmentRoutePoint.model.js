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
          // },
          // Location: {
          //   localField: 'reachedAtLocation',
          //   localKey: 'reachedAtLocationId'
          }
        },
        hasMany: {
          ShipmentRoutePointPhoto: {
            localField: 'photos',
            foreignKey: 'shipmentRoutePointId'
          },
          Shipment: {
            localField: 'shipments',
            foreignKey: 'shipmentId'
          }
        }
      }

    });

  });

})();
