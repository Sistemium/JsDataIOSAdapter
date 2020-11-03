'use strict';

(function () {

  angular.module('Models').run(function (Schema, $q) {

    const {
      WarehouseItemOperation,
      WarehouseBox,
      WarehouseItem,
    } = Schema.models();

    const PickingOrderPositionPicked = Schema.register({

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
          const { code } = this;
          if (!code) {
            return code;
          }
          if (code.length > 8) {
            return `🏷 ${code.substring(code.length - 4)}`;
          }
          const res = code.match(/\d[0]*(.*)/) || [];
          return res.length > 1 ? res [1] : code;
        },

        unlinkWarehouseBox() {

          const { warehouseBoxId } = this;

          if (!warehouseBoxId) {
            return $q.resolve();
          }

          const noCache = { cacheResponse: false };

          return WarehouseItemOperation.findAll({ ownerXid: this.id }, noCache)
            .then(operations => $q.all(_.map(operations, o => o.cancelOperation())))
            .then(() => PickingOrderPositionPicked.findAll({ warehouseBoxId }, noCache))
            .then(res => {

              if (res.length) {
                return;
              }

              return WarehouseItem.findAll({ currentBoxId: warehouseBoxId }, noCache)
                .then(sameBoxItems => $q.all(_.map(sameBoxItems,
                  item => _.assign(item, { processing: 'stock' }).DSCreate())))
                .then(() => WarehouseBox.find(warehouseBoxId, noCache))
                .then(warehouseBox => {

                  warehouseBox.processing = 'stock';
                  warehouseBox.ownerXid = null;

                  return warehouseBox.DSCreate({ cacheResponse: false });

                });
            });

        },

      }

    });

  });

})();
