(function () {

  angular.module('Warehousing')
    .component('warehouseStock', {

      bindings: {
        stocks: '=?',
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

    const { WarehouseStock } = Schema.models();

    vm.use({

      $onInit() {

        if (!vm.stocks && vm.warehouseId) {
          vm.setBusy(refresh(vm.warehouseId));
        }

      },

      itemClick($item) {
        vm.onClick({ $item });
      },

    });

    function refresh(warehouseId) {

      return WarehouseStock.meta.stockByWarehouseId(warehouseId)
        .then(() => {
          const orderBy = [['article.name']];
          vm.rebindAll(WarehouseStock, { warehouseId, orderBy }, 'vm.stocks');
        });

    }

  }

})();
