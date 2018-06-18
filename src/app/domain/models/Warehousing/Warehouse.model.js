(function () {

  angular.module('Warehousing').run((Schema) => {

    Schema.register({

      name: 'Warehouse',

      relations: {
        // hasMany: {
        //   WarehouseStock: {
        //     localField: 'stocks',
        //     foreignKey: 'warehouseId',
        //   },
        // },
      },

    });

  });

})();
