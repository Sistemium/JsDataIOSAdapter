'use strict';

(function () {

  angular.module('Models').run(function (Schema) {

    Schema.register({

      name: 'ContractPriceGroup',

      relations: {
        hasOne: {
          // Contract: {
          //   localField: 'contract',
          //   localKey: 'contractId'
          // },
          // PriceGroup: {
          //   localField: 'priceGroup',
          //   localKey: 'priceGroupId'
          // }
        }
      },

      watchChanges: false

    });

  });

})();
