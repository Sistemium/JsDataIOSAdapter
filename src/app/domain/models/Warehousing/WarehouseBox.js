(function () {

  angular.module('Models').run(Schema => {

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
          switch (this.processing) {
            case 'picked':
              return 'В заказе';
            case 'stock':
            case 'draft':
              return 'На складе';
            default:
              return 'Прочее';
          }
        },

      },

    });

  });

})();
