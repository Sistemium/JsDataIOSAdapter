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
          Visit: [
            {
              localField: 'visitIns',
              foreignKey: 'checkInLocationId'
            },{
              localField: 'visitOuts',
              foreignKey: 'checkOutLocationId'
            }
          ],
          Outlet: {
            localField: 'outlets',
            foreignKey: 'locationId'
          }
        }
      }

    });

  });

})();
