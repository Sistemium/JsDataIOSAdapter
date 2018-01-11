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
      resetHistoryOnInject: false,
      instanceEvents: false,
      // linkRelations: false,
      notify: false,

      meta: {
        data: {}
      },

      cachedFindAll: function(filter, options) {

        const {priceTypeId} = filter;

        if (!priceTypeId) {
          return $q.reject('priceTypeId param must be specified for Price.cachedFindAll()');
        }

        let data = Price.meta.data[priceTypeId];

        if (data) {
          return $q.resolve(data);
        }

        return Price.findAll(filter, _.assign({afterFindAll, cacheResponse: false}, options))
          .then(() => Price.meta.data[priceTypeId]);

        function afterFindAll(options, data) {
          Price.meta.data[priceTypeId] = data;
          // options.cacheResponse = false;
          return [];
        }

      }

    });

  });

})();
