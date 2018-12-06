'use strict';

(function () {

  angular.module('Models').run(function (Schema) {

    Schema.register({

      name: 'PickingOrderPositionPicked',

      relations: {
        belongsTo: {
          PickingOrderPosition: {
            localField: 'parent',
            localKey: 'pickingOrderPositionId'
          }
        },
        hasOne: {
          StockBatch: {
            localField: 'StockBatch',
            localKey: 'stockBatchId'
          }
        }
      },

      // fieldTypes: {
      // code, productionInfo
      // volume: 'int'
      // },

      methods: {
        boxPcs: function () {
          const { parent } = this;
          return parent && parent.Article && parent.Article.boxPcs(this.volume, true) || {};
        },
        codeLabel: function () {
          const res = (this.code || '').match(/\d[0]*(.*)/) || [];

          return res.length > 1 ? res [1] : this.code;
        }
      }

    });

  });

})();
