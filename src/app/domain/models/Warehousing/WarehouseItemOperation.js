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
          }, { cacheResponse: false })
            .then(() =>
              WarehouseItem.find(warehouseItemId, { cacheResponse: false })
                .then(warehouseItem => {
                  warehouseItem.processing = 'stock';
                  warehouseItem.currentBoxId = boxFromId;
                  return warehouseItem.DSCreate({ cacheResponse: false });
                })
            );
        },

      },

      meta: {

        createForOwner({ ownerXid, warehouseBox, warehouseItems, source }) {

          const timestamp = moment().utc().format('YYYY-MM-DD HH:mm:ss.SSS');

          return $q.all(_.map(warehouseItems, item => {

            return $q.when(() => {

              const { id: boxToId } = warehouseBox;
              const { currentBoxId: boxFromId } = item;

              if (boxFromId === boxToId && source === 'PickingOrderPositionPicked') {
                return null;
              }

              return WarehouseItemOperation.create({
                ownerXid,
                source,
                timestamp,
                warehouseItemId: item.id,
                code: warehouseBox.barcode,
                boxToId,
                boxFromId,
              }, { cacheResponse: false });

            })
              .then(() => {
                item.processing = ownerXid ? 'picked' : 'stock';
                item.currentBoxId = warehouseBox.id;
                return item.DSCreate({ cacheResponse: false });
              });

          }));

        },

      }

    });

  });

})();
