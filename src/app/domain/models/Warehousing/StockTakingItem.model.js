(function () {

  angular.module('Warehousing').run(Schema => {

    Schema.register({

      name: 'StockTakingItem',

      // adapter: 'localStorage',

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
        },
        hasMany: {
          StockTakingItemMark: {
            localField: 'marks',
            foreignKey: 'stockTakingItemId',
          },
        },
      },

      methods: {
        markOrVolume() {
          return this.marks.length || this.volume;
        },
      },

    });

  });


})();
