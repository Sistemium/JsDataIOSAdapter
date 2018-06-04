(function () {

  angular.module('Warehousing')
    .component('stockTakingItemView', {
      bindings: {
        stockTakingItemId: '=?ngModel'
      },
      controller: StockTakingItemViewController,

      templateUrl: 'app/domain/warehousing/stockTaking/item/stockTakingItemView.html',
      controllerAs: 'vm',
    });


  function StockTakingItemViewController($scope, saControllerHelper, Schema, $timeout) {

    const {StockTakingItem} = Schema.models();

    const vm = saControllerHelper.setup(this, $scope);

    vm.use({
      $onInit() {

        const { stockTakingItemId } = vm;

        vm.watchScope('vm.stockTakingItemId', onItemIdChange);

        vm.watchScope('vm.volumeViewTouched', touched => {
          if (touched) {
            $timeout.cancel(vm.touchedTimeout);
            vm.touchedTimeout = $timeout(() => vm.volumeViewTouched = false, 4000);
          }
        });

        onItemIdChange(stockTakingItemId);

      }
    });

    /*
    Functions
     */

    function onItemIdChange(id) {
      _.assign(vm, {
        volumeViewTouched: false,
      });
      if (id) {
        vm.rebindOne(StockTakingItem, id, 'vm.stockTakingItem');
      }
    }

  }

})();
