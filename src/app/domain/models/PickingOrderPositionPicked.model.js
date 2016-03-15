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
        },

        methods: {
          boxPcs: function () {
            return this.parent && this.parent.Article && this.parent.Article.boxPcs (this.volume) || {};
          }
        }

      });

    });

})();
