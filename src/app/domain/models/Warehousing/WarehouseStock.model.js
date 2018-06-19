(function () {

  angular.module('Warehousing').run((Schema) => {

    Schema.register({

      name: 'WarehouseStock',
      endpoint: 'Stock',

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

    function stockByWarehouseId(warehouseId) {

      const { Article, WarehouseStock } = Schema.models();

      const where = {
        'ANY stocks': {
          warehouseId: { '==': warehouseId },
        },
      };

      return Article.findAll({ where, limit: 5000 })
        .then(() => {
          return WarehouseStock.findAll({ warehouseId });
        });

    }

  });

})();
