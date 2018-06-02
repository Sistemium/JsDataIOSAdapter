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
  function StockTakingController(Schema, saControllerHelper, $scope, $state) {

    const {
      // ArticleBarCode,
      // BarCodeType,
      // BarcodedArticle,
      StockTaking,
      // StockTakingItem,
    } = Schema.models();

    const vm = saControllerHelper.setup(this, $scope);

    vm.use({

      $onInit() {
        this.refresh();
      },

      addClick() {
        StockTaking.create({
          date: new Date(),
        });
      },

      refresh() {
        const orderBy = [['date', 'DESC']];
        vm.rebindAll(StockTaking, { orderBy }, 'vm.stockTakings');
        StockTaking.findAll();
      },

      stockTakingClick(item) {
        $state.go('.view', { stockTakingId: item.id })
      }

    });

    /*
    Functions
     */

  }

})();
