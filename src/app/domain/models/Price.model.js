'use strict';

(function () {

  angular.module('Models').run(function (Schema) {

    Schema.register({

      name: 'Price',

      relations: {
        hasOne: {
          PriceType: {
            localField: 'priceType',
            localKey: 'priceTypeId'
          }
        }
      },

      watchChanges: false,

      meta: {},

      methods: {}

    });

  });

})();
