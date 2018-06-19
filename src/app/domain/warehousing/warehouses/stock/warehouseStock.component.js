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

    const { WarehouseStock, Article } = Schema.models();

    vm.use({

      $onInit() {

        const { warehouseId } = vm;
        const where = {
          'ANY stocks': {
            warehouseId: { '==': warehouseId },
          },
        };
        const orderBy = [['article.name']];

        WarehouseStock.findAll({ warehouseId });
        Article.findAll({ where, limit: 5000 })
          .then(() => {
            vm.rebindAll(WarehouseStock, { warehouseId, orderBy }, 'vm.stocks');
          });


      },

      itemClick($item) {
        vm.onClick({ $item });
      },

    });

  }

})();
