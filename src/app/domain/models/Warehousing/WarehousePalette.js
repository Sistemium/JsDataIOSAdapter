(function () {

  angular.module('Models').run((Schema, $q, saAsync) => {

    const NO_CACHE = { bypassCache: true, cacheResponse: false };

    Schema.register({

      name: 'WarehousePalette',

      // barcode

      relations: {
        belongsTo: {},
        hasMany: {
          WarehouseBox: {
            localField: 'currentBoxes',
            foreignKey: 'currentPaletteId',
          }
        },
      },

      methods: {

        unloadBoxes(boxes) {

          const timestamp = moment().utc().format('YYYY-MM-DD HH:mm:ss.SSS');
          const { WarehouseBoxOperation } = Schema.models();

          return $q.all(_.map(boxes, warehouseBox =>
            WarehouseBoxOperation.create({
              timestamp,
              source: 'unloadBoxes',
              warehouseBoxId: warehouseBox.id,
              paletteFromId: this.id,
              paletteToId: null,
            }).then(() => {
                // {
                warehouseBox.currentPaletteId = null;
                return warehouseBox.DSCreate();
              }
            )));

        },

        findPaletteBoxes(filter = {}) {

          const { WarehouseBox } = Schema.models();
          const options = { cacheResponse: false };

          return WarehouseBox.findAll(_.assign({ currentPaletteId: this.id, }, filter), options);

        },

        paletteItems() {

          const { WarehouseItem } = Schema.models();

          return this.findPaletteBoxes({ processing: 'stock', ownerXid: null })
            .then(boxes => {

              const boxIds = _.map(boxes, 'id');
              const where = {
                currentBoxId: {
                  '==': boxIds,
                },
              };

              return WarehouseItem.findAll({ where }, { cacheResponse: false, limit: 15000 })
                .then(allItems => {
                  const byId = _.groupBy(allItems, 'currentBoxId');
                  return _.map(boxes, warehouseBox => ({
                    warehouseBox,
                    items: byId[warehouseBox.id],
                  }));
                });

            });

          // function paletteBoxItems(warehouseBox) {
          //   return warehouseBox.boxItems()
          //     .then(items => ({ warehouseBox, items }));
          // }

        },

        paletteArticles(boxedItems) {

          return _.uniqBy(_.flatMap(boxedItems, ({ items }) => {
            return _.uniqBy(_.map(items, 'article'), 'id');
          }), 'id');

        },

        unlinkPickedPaletteBoxes(onBoxProgress = _.noop) {

          const { PickingOrderPositionPicked } = Schema.models();

          return this.findPaletteBoxes({ processing: 'picked' })
            .then(boxes => $q((resolve, reject) => {

              const tasks = _.map(boxes, ({ id: warehouseBoxId }, idx) =>
                done => PickingOrderPositionPicked.findAll({ warehouseBoxId }, NO_CACHE)
                  .then(pickedPositions => {

                    if (!(pickedPositions && pickedPositions.length)) {
                      // TODO: move box to stock
                      return;
                    }

                    return $q.all(pickedPositions.map(pos =>
                      pos.DSDestroy()
                        .then(() => pos.unlinkWarehouseBox())
                    ));

                  })
                  .then(() => {
                    done();
                    onBoxProgress(idx + 1, boxes.length);
                  }, done)
              );

              saAsync.series(tasks, err => {
                if (err) {
                  console.error(err);
                  reject(err);
                } else {
                  resolve();
                }
              });

            }))
            .then(() => {
              this.processing = 'stock';
              this.ownerXid = null;
              return this.DSCreate();
            });

        },

      },

    });

  });

})();
