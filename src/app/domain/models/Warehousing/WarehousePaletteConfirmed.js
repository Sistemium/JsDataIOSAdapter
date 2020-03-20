(function () {

  angular.module('Models').run((Schema, moment) => {

    Schema.register({

      name: 'WarehousePaletteConfirmed',

      // barcode

      methods: {
        statusText() {
          return `Подтверждено ${moment(this.date).format()}`;
        },
      },

    });

  });

})();
