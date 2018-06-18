(function () {

  angular.module('Warehousing')
    .component('warehouseList', {

      bindings: {
        // stockTakings: '=ngModel',
        onClick: '&onClick',
        // scroll: '=',
      },

      controller: WarehouseListController,

      templateUrl: 'app/domain/warehousing/warehouses/list/warehouseList.html',
      controllerAs: 'vm',

    });

  /** @ngInject */
  function WarehouseListController(Schema, saControllerHelper, $scope) {

    const vm = saControllerHelper.setup(this, $scope);
    const { Warehouse, WarehouseStock } = Schema.models();

    vm.use({

      $onInit() {
        vm.rebindAll(Warehouse, { orderBy: [['name']] }, 'vm.warehouses');
        this.refresh();
      },

      itemClick($item) {
        vm.onClick({ $item });
      },

      refresh() {
        vm.setBusy([
          Warehouse.findAll(),
          WarehouseStock.groupBy({}, ['warehouseId'])
            .then(res => {
              vm.stockStats = _.keyBy(res, 'warehouseId');
            }),
        ]);
      },

    });

  }

})();
