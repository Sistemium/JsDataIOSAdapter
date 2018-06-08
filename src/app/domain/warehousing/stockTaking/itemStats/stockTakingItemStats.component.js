(function () {

  angular.module('Warehousing')
    .component('stockTakingItemStats', {

      bindings: {
        filter: '<',
        activeId: '=',
        onItemClick: '&',
        scroll: '=',
      },

      controller: StockTakingItemStatsController,
      templateUrl: 'app/domain/warehousing/stockTaking/itemStats/stockTakingItemStats.html',
      controllerAs: 'vm',

    });


  function StockTakingItemStatsController($scope, saControllerHelper, $anchorScroll, $timeout,
                                          Schema) {

    const { StockTakingItem } = Schema.models();

    const vm = saControllerHelper.setup(this, $scope);

    vm.use({

      $onInit() {
        vm.rebindAll(StockTakingItem, vm.filter, 'vm.stockTakingItems', setStatsData);
        vm.watchScope('vm.activeId', setExpanded);
      },

      itemClick($item) {
        vm.onItemClick({ $item });
      },

    });

    function setExpanded() {
      const { activeId, expandItemId } = vm;
      vm.expandItemId = activeId && _.get(StockTakingItem.get(activeId), 'name') || expandItemId;
    }

    function setStatsData() {

      let data = _.groupBy(vm.stockTakingItems, 'name');

      data = _.map(data, (items, articleName) => ({
        id: articleName,
        articleName,
        items,
        volume: _.sumBy(items, 'volume'),
        packageRel: _.get(_.maxBy(items, 'packageRel'), 'packageRel'),
      }));

      vm.data = _.orderBy(data, 'articleName');

      setExpanded();

    }

  }

})();
