(function () {

  angular.module('Warehousing')
    .service('StockTakingData', StockTakingData);

  function StockTakingData(Schema, $q, DEBUG) {

    const caches = {};
    const { WarehouseStock, StockTaking } = Schema.models();

    return function (filter) {

      let { warehouseId, stockTakingId } = filter;

      const stockTaking = stockTakingId && StockTaking.get(stockTakingId);

      if (!warehouseId && stockTaking) {
        warehouseId = stockTaking.warehouseId;
      }

      if (!warehouseId) {
        throw new Error('no warehouseId in StockTakingData');
      }

      const cache = caches[warehouseId] || setupCache(warehouseId);

      return {
        stockTaking: () => stockTaking,
        stockByArticle,
        promise: promise()
      };

      /*
       Functions
       */

      function stockByArticle(articleId) {

        return caches[warehouseId].articleIndex[articleId];

      }

      function promise() {
        return $q.when(cache)
          .then(cached => caches[warehouseId] = cached);
      }

    };

    /*
    Functions
     */

    function setupCache(warehouseId) {

      const cache = {};

      DEBUG('StockTakingData setupCache', warehouseId);

      return WarehouseStock.meta.stockByWarehouseId(warehouseId)
        .then(stocks => _.assign(cache, {
          clearCache,
          stocks,
          articleIndex: _.keyBy(stocks, 'articleId'),
        }));

      function clearCache() {
        DEBUG('StockTakingData clearCache', warehouseId);
        delete caches[warehouseId];
      }

    }

  }

})();
