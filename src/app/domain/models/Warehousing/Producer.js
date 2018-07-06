(function () {

  angular.module('Warehousing').run(Schema => {

    Schema.register({

      name: 'Producer',

      relations: {
        hasMany: {
          WarehouseArticle: {
            localField: 'warehouseArticles',
            foreignKey: 'producerId',
          },
        }
      },

    });

  });


})();
