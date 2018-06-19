(function () {

  angular.module('Warehousing')
    .service('StockTakingData', StockTakingData);

  function StockTakingData(Schema, $q) {

    const caches = {};
    const { WarehouseStock, StockTaking } = Schema.models();

    return function (filter) {

      let { warehouseId, stockTakingId } = filter;

      if (!warehouseId) {
        warehouseId = StockTaking.get(stockTakingId).warehouseId;
      }

      if (!warehouseId) {
        throw new Error('no warehouseId in StockTakingData');
      }

      const cache = caches[warehouseId] || setupCache(warehouseId);

      return { stockByArticle, promise: promise() };

      /*
       Functions
       */

      function stockByArticle(articleId) {

        return caches[warehouseId].articleIndex[articleId];

      }

      function promise() {
        return $q.when(cache)
          .then(cached => {
            caches[warehouseId] = cached;
          });
      }

    };

    /*
    Functions
     */

    function setupCache(warehouseId) {

      const cache = {};

      return WarehouseStock.findAll({ warehouseId })
        .then(stock => _.assign(cache, {
          stock,
          articleIndex: _.keyBy(stock, 'articleId'),
        }));

    }

  }

})();
