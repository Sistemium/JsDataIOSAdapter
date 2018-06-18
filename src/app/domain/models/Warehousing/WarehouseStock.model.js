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

    });

  });

})();
