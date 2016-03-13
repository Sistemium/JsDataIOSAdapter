'use strict';

(function () {

    angular.module('Models').run(function (Schema) {

      Schema.register ({

        name: 'PickingOrderPositionPicked',

        relations: {
          belongsTo: {
            PickingOrderPosition: {
              localField: 'parent',
              localKey: 'pickingOrderPosition'
            }
          },
          hasOne: {
            StockBatch: {
              localField: 'sb',
              localKey: 'stockBatch'
            }
          }
        },

        fieldTypes: {
          // code, productionInfo
          volume: 'int'
        }

      });

    });

})();
