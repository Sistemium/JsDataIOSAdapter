'use strict';

(function () {

    angular.module('Models').run(function (Schema) {

      Schema.register ({

        name: 'StockBatch',

        relations: {
          hasOne: {
            Article: {
              localField: 'Article',
              localKey: 'article'
            }
          },
          hasMany: {
            StockBatchBarcode: {
              localField: 'StockBatchBarCodes',
              foreignKey: 'stockBatch'
            }
          }
        }

      });

    });

})();
