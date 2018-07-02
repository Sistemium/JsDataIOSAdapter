(function () {

  angular.module('Warehousing')
    .component('stockBatching', {

      bindings: {},

      controller: StockBatchingController,

      templateUrl: 'app/domain/warehousing/stockBatching/stockBatching.html',
      controllerAs: 'vm',

    });

  const NOT_FOUND = 'NOT_FOUND';

  /** @ngInject */
  function StockBatchingController(Schema, saControllerHelper, $scope,
                                   toastr, $state, $q, BarCodeScanner) {

    const {
      StockBatch,
      StockBatchBarCode,
      BarCodeType
    } = Schema.models();

    const {
      // BARCODE_TYPE_ARTICLE,
      BARCODE_TYPE_STOCK_BATCH,
      // BARCODE_TYPE_EXCISE_STAMP,
    } = BarCodeType.meta.types;

    const { BARCODE_SCAN_EVENT } = BarCodeScanner;

    const vm = saControllerHelper.setup(this, $scope).use({

      $onInit() {

        const { stockBatchId } = $state.params;

        if (stockBatchId) {
          loadStockBatch((stockBatchId))
            .catch(() => {
              toastr.error('Этой партии не существует', stockBatchId);
              $state.go('wh.stockBatching');
            });
        }

        $scope.$on(BARCODE_SCAN_EVENT, (e, scan) => vm.onScan(scan));
      },

      onScan,

    });

    /*
    Functions
     */

    function stateName() {

      const { currentState } = vm;

      switch (currentState) {
        case 'stockBatching':
          return 'root';
        case 'create':
        case 'view':
          return currentState;

      }

    }

    function onScan({ code, type = {} }) {

      const barcodeType = type.type;

      if (stateName() === 'create') {
        return;
      }

      console.info(vm.currentState);

      if (barcodeType !== BARCODE_TYPE_STOCK_BATCH) {
        if (stateName() === 'stockBatching') {
          return toastr.error('Это не штрих-код наклейки', code);
        } else {
          return;
        }
      }

      console.warn(code, type && type.code);

      findStockBatch(code)
        .then(({ id: stockBatchId }) => {
          $state.go('wh.stockBatching.view', { stockBatchId })
        })
        .catch(e => {
          if (e === NOT_FOUND) {
            $state.go('wh.stockBatching.create', { code });
          }
        });

    }

    function findStockBatch(code) {
      return StockBatchBarCode.findAll({ code }, { bypassCache: true })
        .then(checkOne)
        .then(({ stockBatchId }) => loadStockBatch(stockBatchId));
    }

    function loadStockBatch(stockBatchId) {
      return StockBatch.find(stockBatchId)
        .then(stockBatch => {
          return stockBatch.DSLoadRelations(['StockBatchBarCode', 'StockBatchItem', 'Article']);
        });
    }

    function checkOne(res) {
      return _.first(res) || $q.reject(NOT_FOUND);
    }

  }

})();
