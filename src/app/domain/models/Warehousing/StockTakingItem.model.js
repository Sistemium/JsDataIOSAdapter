(function () {

  angular.module('Warehousing').run(Schema => {

    Schema.register({

      name: 'StockTakingItem',

      adapter: 'localStorage',

      relations: {
        belongsTo: {
          StockTaking: {
            localField: 'stockTaking',
            localKey: 'stockTakingId',
          },
          Article: {
            localField: 'article',
            localKey: 'articleId',
          }
        }
      },

    });

  });


})();
