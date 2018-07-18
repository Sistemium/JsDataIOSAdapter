(function () {

  angular.module('Warehousing')
    .component('stockTakingItemList', {

      bindings: {
        stockTaking: '<ngModel',
        activeId: '=',
        filter: '<',
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

    vm.watchScope('vm.filter', onFilter);

    vm.use({

      $onInit() {

        onFilter();

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

    function onFilter(search) {

      const orderBy = [['timestamp', 'DESC']];

      const filter = _.assign(
        { stockTakingId: vm.stockTaking.id, orderBy },
        search ? { where: { 'article.name': { likei: `%${search}%` } } } : {}
      );

      vm.rebindAll(StockTakingItem, filter, 'vm.stockTakingItems');

    }

  }

})();
