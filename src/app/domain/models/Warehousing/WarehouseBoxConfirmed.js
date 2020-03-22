(function () {

  angular.module('Models').run((Schema, moment) => {

    Schema.register({

      name: 'WarehouseBoxConfirmed',

      // barcode

      relations: {
        belongsTo: {
          Article: {
            localField: 'article',
            localKey: 'articleId',
          },
        }
      },

      methods: {
        statusText() {
          const { length: pcs } = this.warehouseItemIds || [];
          const { length: stamps } = this.stamps || [];
          return `Подтверждено ${pcs || stamps}б. ${moment(this.date).format()}`;
        },
      },

    });

  });

})();
