'use strict';

(function () {

  angular.module('Models').run(function (Schema, $q) {

    const {
      WarehouseItemOperation,
      WarehouseBox,
    } = Schema.models();

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
        },

        unlinkWarehouseBox() {

          const { warehouseBoxId } = this;

          if (!warehouseBoxId) {
            return $q.resolve();
          }

          return WarehouseBox.find(warehouseBoxId, { cacheResponse: false })
            .then(warehouseBox => {

              // if (warehouseBox.ownerXid !== this.pickingOrderId) {
              //   return;
              // }

              warehouseBox.processing = 'stock';
              warehouseBox.ownerXid = null;

              return WarehouseItemOperation.findAll({
                ownerXid: this.id,
              }, { cacheResponse: false })
                .then(operations => $q.all(_.map(operations, o => o.cancelOperation())))
                .then(() => warehouseBox.DSCreate());

            });

        },

      }

    });

  });

})();
