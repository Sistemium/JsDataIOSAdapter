(function () {

  angular.module('Models').run(Schema => {

    Schema.register({

      name: 'WarehouseBox',

      // barcode

      relations: {
        belongsTo: {
          WarehouseArticle: {
            // optional
            localField: 'warehouseArticle',
            localKey: 'warehouseArticleId'
          }
        },
        hasMany: {
          WarehouseItem: {
            localField: 'currentItems',
            foreignKey: 'currentBoxId',
          }
        },
      },

    });

  });

})();
