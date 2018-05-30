'use strict';

(function () {

  angular.module('Models').run(Schema => {

    Schema.register({

      name: 'StockBatchItem',

      relations: {
        belongsTo: {
          StockBatch: {
            localField: 'stockBatch',
            localKey: 'stockBatchId'
          }
        }
      },

    });

  });

})();
