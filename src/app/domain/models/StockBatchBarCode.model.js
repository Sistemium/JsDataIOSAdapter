'use strict';

(function () {

    angular.module('Models').run(function (Schema) {

      Schema.register ({

        name: 'StockBatchBarCode',

        relations: {
          belongsTo: {
            StockBatch: {
              localField: 'StockBatch',
              localKey: 'stockBatch'
            }
          }
        }

      });

    });

})();
