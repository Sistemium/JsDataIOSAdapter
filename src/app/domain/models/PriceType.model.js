'use strict';

(function () {

  angular.module('Models').run(function (Schema) {

    Schema.register({

      name: 'PriceType',

      relations: {
        hasMany: {
          Price: {
            localField: 'prices',
            foreignKey: 'priceTypeId'
          }
        },
        hasOne: {
          PriceType: {
            localField: 'parent',
            localKey: 'parentId'
          }
        }
      },

      meta: {},

      methods: {}

    });

  });

})();
