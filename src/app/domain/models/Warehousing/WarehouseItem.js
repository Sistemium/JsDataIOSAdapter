(function () {

  angular.module('Models').run(Schema => {

    Schema.register({

      name: 'WarehouseItem',

      // barcode

      relations: {
        belongsTo: {
          Article: {
            localField: 'article',
            localKey: 'articleId'
          },
          WarehouseArticle: {
            localField: 'warehouseArticle',
            localKey: 'warehouseArticleId'
          },
          WarehouseBox: {
            // optional
            localField: 'currentBox',
            localKey: 'currentBoxId'
          },
        }
      },

    });

  });

})();
