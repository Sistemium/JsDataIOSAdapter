'use strict';

(function () {

  angular.module('Models').run(function (Schema, $q) {

    const Stock = Schema.register ({

      name: 'Stock',

      relations: {
        hasOne: {
          Article: {
            localField: 'article',
            localKey: 'articleId'
          }
        }
      },

      watchChanges: false,
      useClass: false,
      instanceEvents: false,
      notify: false,

      meta: {
        cachedFindAll: function(filter, options) {
          if (Stock.meta.data) return $q.resolve(Stock.meta.data);
          return Stock.findAll(filter, _.assign({cacheResponse: false, limit: 10000}, options))
            .then(data => Stock.meta.data = data);
        }
      },

      fieldTypes: {
        volume: 'int'
      }

    });

  });

})();
