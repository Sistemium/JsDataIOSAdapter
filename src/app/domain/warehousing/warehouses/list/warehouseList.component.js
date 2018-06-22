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
  function WarehouseListController(Schema, saControllerHelper, $scope, $q) {

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
          stockStats(),
        ]);
      },

    });

    function stockStats() {
      return WarehouseStock.groupBy({}, ['warehouseId'])
        .then(res => _.keyBy(res, 'warehouseId'))
        .then(stockStats =>
          $q.all(_.map(stockStats, ({ 'max(date)': date }, warehouseId) =>
            WarehouseStock.groupBy({ warehouseId, date }, ['warehouseId'])
              .then(_.first)
              .then(({ 'sum(volume)': volume }) => ({ date, volume, warehouseId }))
          ))
        )
        .then(res => vm.stockStats = _.keyBy(res, 'warehouseId'));
    }

  }

})();
