(function () {

  angular.module('Warehousing')
    .component('stockTakingItemList', {

      bindings: {
        stockTaking: '<ngModel',
        activeId: '=',
        onClick: '&',
        scroll: '=?',
      },

      controller: StockTakingItemListController,
      templateUrl: 'app/domain/warehousing/stockTaking/itemList/stockTakingItemList.html',
      controllerAs: 'vm',

    });


  function StockTakingItemListController($scope, saControllerHelper, Schema, $anchorScroll, $timeout) {

    const { StockTakingItem } = Schema.models();

    const vm = saControllerHelper.setup(this, $scope);

    vm.use({

      $onInit() {

        const orderBy = [['timestamp', 'DESC']];
        const filter = { stockTakingId: vm.stockTaking.id, orderBy };

        vm.rebindAll(StockTakingItem, filter, 'vm.stockTakingItems');

      },

      itemClick($item) {
        vm.onClick({ $item });
      },

      scroll(item) {
        $timeout(250).then(() => {
          $anchorScroll(`id-${item.id}`);
        });
      },

    });

  }

})();
