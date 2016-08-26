'use strict';

(function () {

  angular.module('jsd').run(function (Schema) {

    Schema.register({

      name: 'Location',
      endpoint: 'CoreLocation',

      labels: {
        multiple: 'Геометки',
        single: 'Геометка'
      },

      relations: {
        hasMany: {
          Location: [
            {
              localField: 'visitIn',
              foreignKey: 'checkInLocationId'
            },{
              localField: 'visitOut',
              foreignKey: 'checkOutLocationId'
            },{
              localField: 'outlet',
              foreignKey: 'locationId'
            }
          ]
        }
      }

    });

  });

})();
