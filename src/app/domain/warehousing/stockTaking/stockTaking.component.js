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

    $scope.$on(stockTakingView.destroyEventName, () => {
      $state.go($state.current.data.rootState);
    });

    $scope.$on(stockTakingView.CREATED_EVENT, (event, item) => {
      vm.stockTakingClick(item);
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
        StockTaking.findAll();
      },

      stockTakingClick(item) {
        $state.go(`${$state.current.data.rootState ? '^' : ''}.view`, { stockTakingId: item.id });
      }

    });

    /*
    Functions
     */

  }

})();
