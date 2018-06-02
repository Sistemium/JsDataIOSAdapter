(function () {

  angular.module('Warehousing')
    .component('stockTakingView', {

      bindings: {
        stockTakingId: '=ngModel',
      },

      controller: StockTakingViewController,

      templateUrl: 'app/domain/warehousing/stockTaking/view/stockTakingView.html',
      controllerAs: 'vm',

    });

  // const NOT_FOUND = 'NOT_FOUND';

  /** @ngInject */
  function StockTakingViewController(Schema, saControllerHelper, $scope) {

    const {
      ArticleBarCode,
      BarCodeType,
      // BarcodedArticle,
      StockTaking,
      StockTakingItem,
    } = Schema.models();

    const {
      BARCODE_TYPE_ARTICLE,
    } = BarCodeType.meta.types;

    const vm = saControllerHelper.setup(this, $scope);

    vm.use({

      $onInit() {

        const { stockTakingId } = vm;
        const orderBy = [['date', 'DESC']];

        vm.rebindOne(StockTaking, vm.stockTakingId, 'vm.stockTaking');
        vm.rebindAll(StockTakingItem, { stockTakingId, orderBy }, 'vm.stockTakingItems');

        if (stockTakingId) {
          StockTakingItem.findAll({ stockTakingId })
        }

      },

      onScan({ code, type }) {

        console.info('stockTaking', code, type);

        if (!type || !code || type.type !== BARCODE_TYPE_ARTICLE) {
          return;
        }

        processBarcode(code);

      },

    });

    /*
    Functions
     */

    function processBarcode(code) {
      ArticleBarCode.findAllWithRelations({ code })('Article')
        .then(res => {
          console.info('Found barcodes', res);
        })
        .then(() => {
          StockTakingItem.create({
            stockTakingId: vm.stockTakingId,
            barcode: code,
            volume: 1
          });
        });
    }

  }

})();
