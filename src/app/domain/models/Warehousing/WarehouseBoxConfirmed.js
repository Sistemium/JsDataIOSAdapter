(function () {

  angular.module('Models').run((Schema, moment) => {

    Schema.register({

      name: 'WarehouseBoxConfirmed',

      // barcode

      methods: {
        statusText() {
          const { length: pcs } = this.warehouseItemIds;
          return `Подтверждено ${pcs}б. ${moment(this.date).format()}`;
        },
      },

    });

  });

})();
