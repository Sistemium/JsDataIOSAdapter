'use strict';

(function () {

  angular.module('Models').run(function (Schema) {

    Schema.register({

      name: 'PickingOrderPickedBox',

      relations: {
        belongsTo: {
          PickingOrder: {
            localField: 'parent',
            localKey: 'pickingOrderId',
          },
        },
        hasOne: {
          WarehouseBox: {
            localField: 'warehouseBox',
            localKey: 'warehouseBoxId',
          },
        },
      },

    });

  });

})();
