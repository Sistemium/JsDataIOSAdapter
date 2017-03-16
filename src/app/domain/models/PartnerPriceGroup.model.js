'use strict';

(function () {

  angular.module('Models').run(function (Schema) {

    Schema.register({

      name: 'PartnerPriceGroup',

      relations: {
        hasOne: {
          // Contract: {
          //   localField: 'partner',
          //   localKey: 'partnerId'
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
