(function () {

  angular.module('Warehousing').run((Schema, moment) => {

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

      const limit = 5000;

      return Article.findAll({ where, limit })
        .then(() => {
          return WarehouseStock.findAll({
            warehouseId,
            date: moment(date).format(),
          }, { bypassCache: true, limit });
        });

    }

  });

})();
