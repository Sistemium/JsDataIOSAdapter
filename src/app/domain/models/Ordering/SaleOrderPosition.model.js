'use strict';

(function () {

  angular.module('Models').run(function (Schema, $q) {

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

        updateTs: function() {
          this.deviceTs = moment().format('YYYY-MM-DD HH:mm:ss.SSS');
        },

        updateCost: function () {
          this.priceDoc = this.price;
          this.cost = parseFloat((this.price * this.volume).toFixed(2));
          this.updateTs();
        },

        safeSave: function () {

          let lastModified = this.deviceTs;

          if (this.volume > 0) {
            return SaleOrderPosition.create(this, {
              afterUpdate: (options, attrs) => {
                // FIXME: copy-pasted from SaleOrder.model
                let nowModified = this.deviceTs;
                if (nowModified > lastModified) {
                  options.cacheResponse = false;
                  console.warn('Ignore server response SaleOrderPosition', nowModified, lastModified);
                } else {
                  console.info('SaleOrderPosition last modified:', lastModified, nowModified);
                }
                return $q.resolve(attrs);
              }
            });
          } else {
            return SaleOrderPosition.destroy(this);
          }

        },

        discountPercent: function () {
          return this.priceOrigin ? _.round ( 100.0 * this.price / this.priceOrigin - 100, 2) : undefined;
        },

        boxVolume: function () {
          return this.article && this.article.boxVolume(this.volume) || 0;
        },

      }

    });

  });

})();
