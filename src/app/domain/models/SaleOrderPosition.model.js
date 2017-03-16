'use strict';

(function () {

  angular.module('Models').run(function (Schema) {

    const SaleOrderPosition = Schema.register({

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

      // fieldTypes: {
        // price: 'decimal',
        // priceDoc: 'decimal',
        // priceOrigin: 'decimal',
        // cost: 'decimal',
        // volume: 'int',
        // backVolume: 'int'
      // },

      aggregables: ['cost', 'volume'],

      methods: {
        updateCost: function () {
          return this.cost = parseFloat((this.price * this.volume).toFixed(2));
        },

        safeSave: function () {

          let options = {keepChanges: ['cost', 'volume']};

          if (this.volume > 0) {
            return SaleOrderPosition.unCachedSave(this, options);
          } else {
            return SaleOrderPosition.destroy(this);
          }

        },

        discountPercent: function () {
          return this.priceOrigin ? _.round ( 100.0 * this.price / this.priceOrigin - 100, 2) : undefined;
        }

      }

    });

  });

})();
