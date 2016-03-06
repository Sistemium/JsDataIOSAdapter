'use strict';

(function () {

    angular.module('Models').run(function (Schema) {

      Schema.register ({

        name: 'Article',

        relations: {
          belongsTo: {
            ArticleGroup: {
              localField: 'ArticleGroup',
              localKey: 'articleGroup'
            }
          },
          hasMany: {
            StockBatch: {
              localField: 'stockBatches',
              foreignKey: 'article'
            },
            PickingOrderPosition: {
              localField: 'pickingOrderPositions',
              foreignKey: 'article'
            }
          }
        },

        fieldTypes: {
          packageRel: 'int',
          pieceVolume: 'decimal'
        },

        methods: {

          boxVolume: function (volume) {
            return volume / this.packageRel;
          },

          boxPcs: function (volume) {

            var rel = this.packageRel;
            var box = Math.floor (volume / rel) || 0;
            var pcs = volume - box * rel;

            return {
              box: box,
              pcs: pcs,
              full: (box ? box + ' к' : '')
              + (box && pcs && ' ' || '')
              + (pcs ? pcs + ' б' : '')
            }

          }

        }

      });

    });

})();
