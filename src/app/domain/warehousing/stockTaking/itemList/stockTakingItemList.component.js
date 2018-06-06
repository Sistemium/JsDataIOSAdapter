(function () {

  angular.module('Warehousing')
    .component('stockTakingItemList', {

      bindings: {
        filter: '<',
        activeId: '=',
        onClick: '&',
      },

      controller: StockTakingItemListController,
      templateUrl: 'app/domain/warehousing/stockTaking/itemList/stockTakingItemList.html',
      controllerAs: 'vm',

    });


  function StockTakingItemListController($scope, saControllerHelper, Schema) {

    const { StockTakingItem } = Schema.models();

    const vm = saControllerHelper.setup(this, $scope);

    vm.use({

      $onInit() {

        const orderBy = [['timestamp', 'DESC']];

        vm.rebindAll(StockTakingItem, _.assign({ orderBy }, vm.filter), 'vm.stockTakingItems');

      },

      itemClick($item) {
        vm.onClick({ $item });
      }

    });

  }

})();
