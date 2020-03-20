(function () {

  angular.module('Models').run((Schema, moment) => {

    Schema.register({

      name: 'WarehousePaletteConfirmed',

      // barcode

      methods: {
        statusText() {
          const { length: box } = this.warehouseBoxIds;
          return `Подтверждено ${box}к. ${moment(this.date).format()}`;
        },
      },

    });

  });

})();
