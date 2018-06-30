(function () {

  angular.module('Warehousing')
    .component('warehouseStock', {

      bindings: {
        stocks: '=?',
        warehouseId: '<',
        date: '<',
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
          vm.setBusy(refresh(vm.warehouseId, vm.date));
        }

      },

      itemClick($item) {
        vm.onClick({ $articleId: $item.articleId });
      },

    });

    function refresh(warehouseId, date) {

      return WarehouseStock.meta.stockByWarehouseId(warehouseId, date)
        .then(() => {
          const orderBy = [['article.name']];
          vm.rebindAll(WarehouseStock, { warehouseId, orderBy }, 'vm.stocks');
        });

    }

  }

})();
