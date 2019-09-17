'use strict';

(function () {

  angular.module('Models').run(function (Schema) {

    const totalVolume = Schema.aggregate('volume').sum;

    Schema.register({

      name: 'StockBatch',

      relations: {
        hasOne: {
          Article: {
            localField: 'Article',
            localKey: 'articleId'
          }
        },
        hasMany: {
          StockBatchItem: {
            localField: 'items',
            foreignKey: 'stockBatchId'
          },
          StockBatchBarCode: {
            localField: 'stockBatchBarCodes',
            foreignKey: 'stockBatchId'
          },
          PickingOrderPositionPicked: {
            localField: 'pickedPickingOrderPositions',
            foreignKey: 'stockBatchId'
          }
        }
      },

      methods: {

        spareVolume: function () {
          const volume = (this.volume || 0) - (totalVolume(this.pickedPickingOrderPositions) || 0);
          return volume > 0 ? volume : 0;
        }

      },

      meta: {}

    });

  });

})();
