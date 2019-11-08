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

      computed: {
        displayLabel: ['barcode', barcode => {
          return barcode.slice(6, 18);
        }],
      },

    });

  });


})();
