(function () {

  angular.module('Models').run((Schema, $q, saAsync, Language) => {

    const NO_CACHE = { bypassCache: true, cacheResponse: false };
    const SOCKET_SOURCE = { cacheResponse: false, socketSource: true };

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

        statusLabel() {
          return Language.statusLabel(this.processing);
        },

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

          return WarehouseBox.findAll(_.assign({ currentPaletteId: this.id, }, filter), SOCKET_SOURCE);

        },

        paletteItems() {

          const { WarehouseItem } = Schema.models();
          const options = _.assign({ limit: 15000, field: 'currentBoxId' }, SOCKET_SOURCE);

          return this.findPaletteBoxes({ processing: 'stock', ownerXid: null })
            .then(boxes => {

              const boxIds = _.map(boxes, 'id');
              // const where = {
              //   currentBoxId: {
              //     '==': boxIds,
              //   },
              // };

              return WarehouseItem.findByMany(boxIds, options)
                .then(items => {
                  const uniqItems = _.uniqBy(items, 'articleId');
                  const load = _.map(uniqItems, item => WarehouseItem.loadRelations(item, 'Article'));
                  return $q.all(load).then(() => items);
                })
                .then(allItems => {
                  const byId = _.groupBy(allItems, 'currentBoxId');
                  const boxed = _.map(boxes, warehouseBox => ({
                    warehouseBox,
                    items: byId[warehouseBox.id],
                  }));
                  return _.filter(boxed, 'items');
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
