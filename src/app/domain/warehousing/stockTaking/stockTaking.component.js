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
  function StockTakingController(Schema, saControllerHelper, $scope) {

    const {
      ArticleBarCode,
      BarCodeType,
    } = Schema.models();

    const {
      BARCODE_TYPE_ARTICLE,
    } = BarCodeType.meta.types;

    const vm = saControllerHelper.setup(this, $scope);

    vm.use({

      $onInit() {
        //
      },

      onScan({ code, type }) {

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
      ArticleBarCode.findAll({code})
        .then(res => {
          console.info('Found barcodes', res);
        });
    }

  }

})();
