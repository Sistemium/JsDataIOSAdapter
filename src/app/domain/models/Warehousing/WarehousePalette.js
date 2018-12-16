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

        paletteItems() {

          const { WarehouseBox } = Schema.models();

          return WarehouseBox.findAll({ currentPaletteId: this.id }, { cacheResponse: false })
            .then(boxes => $q.all(_.map(boxes, paletteBoxItems)));

          function paletteBoxItems(warehouseBox) {
            return warehouseBox.boxItems()
              .then(items => ({ warehouseBox, items }));
          }

        },

      },

    });

  });

})();
