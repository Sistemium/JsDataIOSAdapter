'use strict';

(function () {

  angular.module('Models').run(function (Schema) {

    Schema.register({

      name: 'SaleOrder',

      relations: {
        hasOne: {
          Salesman: {
            localField: 'salesman',
            localKey: 'salesmanId'
          },
          Outlet: {
            localField: 'outlet',
            localKey: 'outletId'
          }
        },
        hasMany: {
          SaleOrderPosition: {
            localField: 'positions',
            foreignKey: 'saleOrderPositionId'
          }
        }
      },

      computed: {}

    });

  });

})();
