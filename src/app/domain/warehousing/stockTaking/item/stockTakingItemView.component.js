(function () {

  const DESTROY_EVENT = 'stock-taking-item-destroy';

  angular.module('Warehousing')
    .constant('stockTakingItemView', { DESTROY_EVENT })
    .component('stockTakingItemView', {
      bindings: {
        stockTakingItemId: '=?ngModel',
      },
      controller: StockTakingItemViewController,

      templateUrl: 'app/domain/warehousing/stockTaking/item/stockTakingItemView.html',
      controllerAs: 'vm',
    });


  function StockTakingItemViewController($scope, saControllerHelper, Schema,
                                         $timeout, StockTakingData) {

    const { StockTakingItem } = Schema.models();

    const vm = saControllerHelper.setup(this, $scope);

    vm.use({

      $onInit() {

        const { stockTakingItemId } = vm;

        vm.watchScope('vm.stockTakingItemId', onItemIdChange);

        vm.watchScope('vm.volumeViewTouched', touched => {
          if (touched) {
            $timeout.cancel(vm.touchedTimeout);
            vm.touchedTimeout = $timeout(4000)
              .then(() => {
                vm.volumeViewTouched = false;
              });
          }
        });

        vm.watchScope('vm.stockTakingItem.volume', _.debounce(() => {
          if (_.get(vm.stockTakingItem, 'id')) {
            vm.stockTakingItem.DSHasChanges() && vm.stockTakingItem.DSCreate();
          }
        }, 1000));

        onItemIdChange(stockTakingItemId);

      },

      deleteClick() {
        vm.stockTakingItem && vm.stockTakingItem.DSDestroy()
          .then(() => $scope.$emit(DESTROY_EVENT, vm.stockTakingItem));
      },

      itemClick($item) {
        vm.stockTakingItemId = $item.id;
      },

    });

    /*
    Functions
     */

    function onItemIdChange(id) {
      _.assign(vm, {
        volumeViewTouched: false,
      });
      if (id) {
        vm.rebindOne(StockTakingItem, id, 'vm.stockTakingItem', onRebind);
      }
    }

    function onRebind() {
      const { stockTakingItem } = vm;
      const { stockTakingId, articleId } = stockTakingItem;
      const stockTakingData = StockTakingData({ stockTakingId });
      const items = StockTakingItem.filter({ articleId, stockTakingId });
      vm.stockTakingArticle = stockTakingData.resultByArticle(items, articleId);
      vm.stockTakingArticleItems = _.orderBy(items, ['timestamp'], ['desc']);
    }

  }

})();
