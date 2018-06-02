(function () {

  angular.module('Warehousing').run(Schema => {

    Schema.register({

      name: 'StockTakingItem',

      adapter: 'localStorage',

      relations: {
        belongsTo: {
          StockTaking: {
            localKey: 'stockTakingId',
            localField: 'stockTaking',
          }
        }
      },

    });

  });


})();
