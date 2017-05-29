'use strict';

(function () {

  angular.module('Models').run(function (Schema, PhotoHelper) {

    Schema.register(PhotoHelper.setupModel({

      name: 'ShipmentRoutePointPhoto',

      relations: {
        hasOne: {
          ShipmentRoutePoint: {
            localField: 'shipmentRoutePoint',
            localKey: 'shipmentRoutePointId'
          }
        }
      }

    }));

  });

})();
