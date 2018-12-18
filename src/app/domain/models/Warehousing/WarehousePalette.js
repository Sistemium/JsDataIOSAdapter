(function () {

  angular.module('Models').run((Schema, $q) => {

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

          // const timestamp = moment().utc().format('YYYY-MM-DD HH:mm:ss.SSS');
          // const { WarehouseBoxOperation } = Schema.models();

          return $q.all(_.map(boxes, warehouseBox =>
            // WarehouseBoxOperation.create({
            //   timestamp,
            //   source: 'unloadBoxes',
            //   warehouseBoxId: warehouseBox.id,
            //   paletteFromId: this.id,
            //   paletteToId: null,
            // }).then(() => {
            {
              warehouseBox.currentPaletteId = null;
              return warehouseBox.DSCreate();
            }
          ));

        },

        paletteItems() {

          const { WarehouseBox, WarehouseItem } = Schema.models();

          return WarehouseBox.findAll({
            currentPaletteId: this.id,
            processing: 'stock',
            ownerXid: null,
          }, { cacheResponse: false })
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

        }

      },

    });

  });

})();
