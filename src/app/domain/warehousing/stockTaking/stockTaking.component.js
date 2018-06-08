(function () {

  angular.module('Warehousing')
    .component('stockTaking', {

      bindings: {},

      controller: StockTakingController,

      templateUrl: 'app/domain/warehousing/stockTaking/stockTaking.html',
      controllerAs: 'vm',

    });

  // const NOT_FOUND = 'NOT_FOUND';

  /** @ngInject */
  function StockTakingController(Schema, saControllerHelper, $scope, $state,
                                 stockTakingView) {

    const {
      // ArticleBarCode,
      // BarCodeType,
      // BarcodedArticle,
      StockTaking,
      // StockTakingItem,
    } = Schema.models();

    const vm = saControllerHelper.setup(this, $scope);

    $scope.$on(stockTakingView.DESTROY_EVENT, () => {
      $state.go($state.current.data.rootState);
    });

    $scope.$on(stockTakingView.CREATED_EVENT, (event, stockTaking, stockTakingItem) => {
      vm.stockTakingClick(stockTaking, stockTakingItem);
    });

    vm.use({

      $onInit() {
        this.refresh();
      },

      addClick() {
        $state.go('.create');
      },

      refresh() {
        const orderBy = [['date', 'DESC']];
        vm.rebindAll(StockTaking, { orderBy }, 'vm.stockTakings');
        vm.setBusy([
          StockTaking.findAll(),
        ])
      },

      stockTakingClick(stockTaking, stockTakingItem) {

        const params = {
          stockTakingId: stockTaking.id
        };


        let viewState = `${$state.current.data.rootState ? '^' : ''}.view`;

        if (stockTakingItem) {
          params.stockTakingItemId = stockTakingItem.id;
          viewState += '.item';
        }

        $state.go(viewState, params);

      }

    });

    /*
    Functions
     */

  }

})();
