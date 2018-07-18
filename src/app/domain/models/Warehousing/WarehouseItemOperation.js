(function () {

  angular.module('Models').run(Schema => {

    Schema.register({

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

    });

  });

})();
