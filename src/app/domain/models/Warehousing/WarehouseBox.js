(function () {

  angular.module('Models').run((Schema, Language) => {

    Schema.register({

      name: 'WarehouseBox',

      // barcode

      relations: {
        belongsTo: {
          // WarehouseArticle: {
          //   // optional
          //   localField: 'warehouseArticle',
          //   localKey: 'warehouseArticleId'
          // }
        },
        hasMany: {
          WarehouseItem: {
            localField: 'currentItems',
            foreignKey: 'currentBoxId',
          }
        },
      },

      methods: {

        statusLabel() {
          return Language.statusLabel(this.processing);
        },

      },

    });

  });

})();
