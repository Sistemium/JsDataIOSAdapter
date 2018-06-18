(function () {

  angular.module('Warehousing')
    .component('warehouseStock', {

      bindings: {
        warehouseId: '<',
        onClick: '&onClick',
      },

      controller: StockTakingListController,

      templateUrl: 'app/domain/warehousing/warehouses/stock/warehouseStock.html',
      controllerAs: 'vm',

    });

  /** @ngInject */
  function StockTakingListController(Schema, saControllerHelper, $scope) {

    const vm = saControllerHelper.setup(this, $scope);

    const { WarehouseStock } = Schema.model();

    vm.use({

      $onInit() {
        const { warehouseId } = vm;
        WarehouseStock.findAll({ warehouseId });
        vm.rebindAll(WarehouseStock, { warehouseId }, 'vm.stocks');
      },

      stockTakingClick($item) {
        vm.onClick({ $item });
      },

    });

  }

})();
