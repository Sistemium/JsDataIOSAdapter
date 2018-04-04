'use strict';

(function () {

  angular.module('Models').run(function (Schema, $q) {

    const destroyedCache = {};

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

      computed: {
        selfCost: ['volume', 'priceAgent', selfCost],
        costDoc: ['volume', 'priceDoc', costDoc]
      },

      aggregables: ['cost', 'volume', 'selfCost', 'costDoc'],

      methods: {

        updateTs: function () {
          this.deviceTs = moment().format('YYYY-MM-DD HH:mm:ss.SSS');
        },

        updateCost: function () {
          this.updateTs();
          // this.priceDoc = this.price;
          this.cost = parseFloat((this.price * this.volume).toFixed(2));
          SaleOrderPosition.compute(this);
        },

        safeSave: function () {

          let lastModified = this.deviceTs;

          if (this.volume > 0) {
            return SaleOrderPosition.create(this, {
              afterUpdate: (options, attrs) => {
                // FIXME: copy-pasted from SaleOrder.model
                let nowModified = this.deviceTs;
                if (isDeleted(this.id)) {
                  options.cacheResponse = false;
                  // console.warn('Ignore destroyed SaleOrderPosition', this.id, nowModified, lastModified);
                } else if (nowModified > lastModified) {
                  options.cacheResponse = false;
                  // console.warn('Ignore server response SaleOrderPosition', nowModified, lastModified);
                } else {
                  // console.info('SaleOrderPosition last modified:', lastModified, nowModified);
                }
                return $q.resolve(attrs);
              }
            });
          } else {
            return SaleOrderPosition.destroy(this)
              .then(() => {
                destroyedCache[this.id] = lastModified;
              });
          }

        },

        discountPercent: function () {
          return this.priceOrigin ? _.round(100.0 * this.price / this.priceOrigin - 100, 2) : undefined;
        },

        boxVolume: function () {
          return this.article && this.article.boxVolume(this.volume) || 0;
        }

      },

      meta: {
        isDeleted
      }

    });

    function isDeleted(id) {
      return destroyedCache[id];
    }

    function selfCost(volume = 0, priceAgent = 0) {
      return parseFloat((volume * priceAgent).toFixed(2));
    }

    function costDoc(volume = 0, priceDoc = 0) {
      return parseFloat((volume * priceDoc).toFixed(2));
    }

  });

})();
