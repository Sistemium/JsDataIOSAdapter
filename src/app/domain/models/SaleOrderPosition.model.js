'use strict';

(function () {

  angular.module('Models').run(function (Schema) {

    Schema.register({

      name: 'SaleOrderPosition',

      relations: {
        hasOne: {
          SaleOrder: {
            localField: 'saleOrder',
            localKey: 'saleOrderId'
          },
          Article: {
            localField: 'article',
            localKey: 'articleId'
          }
        }
      },

      fieldTypes: {
        price: 'decimal',
        priceDoc: 'decimal',
        priceOrigin: 'decimal',
        cost: 'decimal',
        volume: 'int',
        backVolume: 'int'
      },

      aggregables: ['cost', 'volume'],

      methods: {
        updateCost: function () {
          return this.cost = parseFloat((this.price * this.volume).toFixed(2));
        }
      }

    });

  });

})();
