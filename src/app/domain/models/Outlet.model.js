'use strict';

(function () {

  angular.module('Models').run(function (Schema) {

    Schema.register({

      name: 'Outlet',

      labels: {
        multiple: 'Клиенты',
        single: 'Клиент'
      },

      relations: {
        hasOne: {
          Partner: {
            localField: 'partner',
            localKey: 'partnerId'
          }
        },
        hasMany: {
          // PickingRequest: {
          //   localField: 'pickingOrders',
          //   foreignKey: 'outlet'
          // }
        }
      }

    });

  });

})();
