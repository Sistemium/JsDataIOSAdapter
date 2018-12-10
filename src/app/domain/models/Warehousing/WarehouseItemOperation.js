(function () {

  angular.module('Models').run((Schema, $q, moment) => {

    const WarehouseItemOperation = Schema.register({

      name: 'WarehouseItemOperation',

      // timestamp
      // type: [create|move|destroy|lost]

      relations: {
        belongsTo: {
          WarehouseItem: {
            localField: 'item',
            localKey: 'warehouseItemId'
          },
          WarehouseBox: [{
            // optional
            localField: 'boxFrom',
            localKey: 'boxFromId'
          }, {
            // optional
            localField: 'boxTo',
            localKey: 'boxToId'
          }],
        }
      },

      methods: {

        cancelOperation() {

          const { WarehouseItem } = Schema.models();
          const { boxFromId, boxToId, warehouseItemId } = this;

          return WarehouseItemOperation.create({
            ownerXid: null,
            source: 'cancel',
            timestamp: moment().utc().format('YYYY-MM-DD HH:mm:ss.SSS'),
            boxToId: boxFromId,
            boxFromId: boxToId,
            warehouseItemId,
          })
            .then(() =>
              WarehouseItem.find(warehouseItemId, { cacheResponse: false })
                .then(warehouseItem => {
                  warehouseItem.processing = 'stock';
                  warehouseItem.currentBoxId = boxFromId;
                  return warehouseItem.DSCreate();
                })
            );
        },

      },

      meta: {

        createForOwner({ ownerXid, warehouseBox, warehouseItems, source }) {

          return $q.all(_.map(warehouseItems, item => WarehouseItemOperation.create({
            ownerXid,
            source,
            warehouseItemId: item.id,
            code: warehouseBox.barcode,
            boxToId: warehouseBox.id,
            boxFromId: warehouseBox.id,
            timestamp: moment().utc().format('YYYY-MM-DD HH:mm:ss.SSS'),
          }).then(() => {
            item.processing = 'picked';
            return item.DSCreate();
          })));

        },

      }

    });

  });

})();
