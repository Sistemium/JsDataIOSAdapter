(function () {

  angular.module('Warehousing').run((Schema) => {

    Schema.register({

      name: 'WarehouseStock',

      relations: {
        belongsTo: {
          Warehouse: {
            localField: 'warehouse',
            localKey: 'warehouseId',
          },
          Article: {
            localField: 'article',
            localKey: 'articleId',
          },
        },
      },

      meta: {
        stockByWarehouseId
      }

    });

    function stockByWarehouseId(warehouseId, date) {

      const { Article, WarehouseStock } = Schema.models();

      const where = {
        'ANY warehouseStocks': {
          warehouseId: { '==': warehouseId },
        },
      };

      return Article.findAll({ where, limit: 5000 })
        .then(() => {
          return WarehouseStock.findAll({ warehouseId, date }, { bypassCache: true });
        });

    }

  });

})();
