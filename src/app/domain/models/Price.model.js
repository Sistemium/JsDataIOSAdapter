'use strict';

(function () {

  angular.module('Models').run(function (Schema, $q) {

    const Price = Schema.register({

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
      useClass: false,
      instanceEvents: false,
      linkRelations: false,
      notify: false,

      meta: {
        cachedFindAll: function(options) {
          if (Price.meta.data) return $q.resolve();
          return Price.findAll({}, _.assign({cacheResponse: false}, options))
            .then(data => Price.meta.data = _.groupBy(data, 'priceTypeId'));
        }
      }

    });

  });

})();
