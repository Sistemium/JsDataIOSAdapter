'use strict';

(function () {

  angular.module('Models').run(function (Schema) {

    Schema.register({

      name: 'ShipmentRoutePointShipment',

      relations: {
        hasOne: {
          Shipment: {
            localField: 'shipment',
            localKey: 'shipmentId'
          },
          ShipmentRoutePoint: {
            localField: 'shipmentRoutePoint',
            localKey: 'shipmentRoutePointId'
          }
        }
      }

    });

  });

})();
