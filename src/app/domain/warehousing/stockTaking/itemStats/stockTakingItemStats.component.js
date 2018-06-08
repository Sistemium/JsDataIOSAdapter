(function () {

  angular.module('Warehousing')
    .component('stockTakingItemStats', {

      bindings: {
        filter: '<',
        activeId: '=',
        onClick: '&',
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
      }

    });


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

    }

  }

})();
