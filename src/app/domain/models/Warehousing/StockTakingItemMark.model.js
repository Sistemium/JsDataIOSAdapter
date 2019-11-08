(function () {

  angular.module('Warehousing').run(Schema => {

    Schema.register({

      name: 'StockTakingItemMark',

      relations: {
        belongsTo: {
          StockTakingItem: {
            localField: 'stockTakingItem',
            localKey: 'stockTakingItemId',
          },
        }
      },

    });

  });


})();
