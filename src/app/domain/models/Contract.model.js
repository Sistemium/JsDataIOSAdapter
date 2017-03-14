'use strict';

(function () {

  angular.module('Models').run(function (Schema) {

    Schema.register({

      name: 'Contract',

      relations: {
        hasMany: {
          OutletSalesmanContract: {
            localField: 'outletSalesmanContracts',
            foreignKey: 'contractId'
          },
          SaleOrder: {
            localField: 'saleOrders',
            foreignKey: 'contractId'
          }
        },
        hasOne: {
          Partner: {
            localField: 'partner',
            localKey: 'partnerId'
          }
        }
      },

      watchChanges: false

    });

  });

})();
