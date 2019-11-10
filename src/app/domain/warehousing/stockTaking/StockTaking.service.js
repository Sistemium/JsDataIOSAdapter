(function () {

  angular.module('Warehousing')
    .service('StockTakingService', StockTakingService);

  function StockTakingService(Schema, $state, DEBUG) {

    DEBUG('init');

    return {
      goToItem(stockTakingItemId) {
        $state.go('wh.stockTaking.view.item', { stockTakingItemId })
      },
    };

  }

})();
