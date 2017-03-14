'use strict';

(function () {

  angular.module('Models').run(function (Schema) {

    Schema.register({

      name: 'OutletSalesmanContract',

      relations: {
        hasOne: {
          Outlet: {
            localField: 'outlet',
            localKey: 'outletId'
          },
          Salesman: {
            localField: 'salesman',
            localKey: 'salesmanId'
          },
          Contract: {
            localField: 'contract',
            localKey: 'contractId'
          },
          PriceType: {
            localField: 'priceType',
            localKey: 'priceTypeId'
          }
        }
      }
    });
  });

})();
