'use strict';

(function () {

  angular.module('Models').run(function (Schema) {

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
      // useClass: false,
      instanceEvents: false,
      // linkRelations: false,
      notify: false,


      cachedFindAll: function(filter, options) {
        return Schema.config.cachedFindAll.call(Price, filter, options)
          .then(data => Price.meta.data = _.groupBy(data, 'priceTypeId'));
      },

      meta: {
      }

    });

  });

})();
