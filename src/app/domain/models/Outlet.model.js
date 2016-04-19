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
        hasMany: {
          PickingRequest: {
            localField: 'pickingOrders',
            foreignKey: 'outlet'
          }
        }
      }

    });

  });

})();
