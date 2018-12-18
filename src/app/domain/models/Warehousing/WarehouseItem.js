(function () {

  angular.module('Models').run((Schema, $q) => {

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

      methods: {

        itemBox() {

          const { currentBoxId } = this;
          const { WarehouseBox } = Schema.models();
          const options = { cacheResponse: false };

          if (!currentBoxId) {
            return $q.reject(new Error('Not found'));
          }

          return WarehouseBox.find(currentBoxId, options);

        },

      },

    });

  });

})();
