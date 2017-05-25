'use strict';

(function () {

  angular.module('Models').run(function (Schema) {

    Schema.register({

      name: 'ShipmentRoute',

      relations: {
        hasOne: {
          Driver: {
            localField: 'driver',
            localKey: 'driverId'
          }
        }
      }

    });

  });

})();
