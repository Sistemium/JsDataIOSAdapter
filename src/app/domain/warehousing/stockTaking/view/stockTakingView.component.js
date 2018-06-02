(function () {

  const CREATED_EVENT = 'stock-taking-created';

  angular.module('Warehousing')
    .constant('stockTakingView', {
      destroyEventName: 'stock-taking-view-destroy',
      CREATED_EVENT,
    })
    .component('stockTakingView', {

      bindings: {
        stockTakingId: '=?ngModel',
      },

      controller: StockTakingViewController,

      templateUrl: 'app/domain/warehousing/stockTaking/view/stockTakingView.html',
      controllerAs: 'vm',

    });


  /** @ngInject */
  function StockTakingViewController(Schema, saControllerHelper, $scope, $q) {

    const {
      ArticleBarCode,
      BarCodeType,
      // BarcodedArticle,
      StockTaking,
      StockTakingItem,
    } = Schema.models();

    const vm = saControllerHelper.setup(this, $scope);

    vm.use({

      BARCODE_TYPE: BarCodeType.meta.types.BARCODE_TYPE_ARTICLE,

      $onInit() {

        const { stockTakingId } = vm;

        if (stockTakingId) {
          const orderBy = [['date', 'DESC']];

          vm.rebindOne(StockTaking, vm.stockTakingId, 'vm.stockTaking');
          vm.rebindAll(StockTakingItem, { stockTakingId, orderBy }, 'vm.stockTakingItems');

          return StockTakingItem.findAll({ stockTakingId })
        }

        vm.stockTaking = StockTaking.createInstance({
          date: new Date(),
        });

      },

      onScan({ code }) {

        processBarcode(code);

      },

      deleteClick() {
        (vm.stockTakingId ? vm.stockTaking.DSDestroy() : $q.resolve())
          .then(() => $scope.$emit('stock-taking-view-destroy'));
      },

    });

    /*
    Functions
     */

    function processBarcode(code) {

      const {stockTakingId, stockTaking} = vm;

      ArticleBarCode.findAllWithRelations({ code })('Article')
        .then(res => {
          console.info('Found barcodes', res);
          return res;
        })
        .then(() => {
          if (!stockTakingId) {
            return StockTaking.create(stockTaking);
          }
        })
        .then(() => StockTakingItem.create({
          stockTakingId: stockTaking.id,
          barcode: code,
          volume: 1
        }))
        .then(() => {
          $scope.$emit(CREATED_EVENT, stockTaking);
          vm.stockTakingId = stockTaking.id;
        });

    }

  }

})();
