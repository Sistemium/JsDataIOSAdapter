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
      ArticleBarCode,
      BarCodeScan,
      StockBatchItem,
      BarCodeType
    } = Schema.models();

    const {
      BARCODE_TYPE_ARTICLE,
      BARCODE_TYPE_STOCK_BATCH,
      BARCODE_TYPE_EXCISE_STAMP,
    } = BarCodeType.meta.types;

    const { BARCODE_SCAN_EVENT } = BarCodeScanner;

    const vm = saControllerHelper.setup(this, $scope).use({

      $onInit() {
        // vm.barcode = {};
        // vm.waitForBarcodeOf(BARCODE_TYPE_ARTICLE);

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

      createClick() {
        createStockBatch();
      },

      onScan,
      waitForBarcodeOf,

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

      if (stateName() === 'create') {
        return;
      }

      console.info(vm.currentState);

      if (type.type !== 'StockBatch') {
        return toastr.error('Это не штрих-код наклейки', code);
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
      return StockBatchBarCode.findAll({ code })
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

    function saveDeep(stockBatch) {

      if (!stockBatch.id) {
        return $q.resolve();
      }

      return stockBatch.DSCreate();

    }

    function createStockBatch(code) {
      vm.stockBatch = StockBatch.createInstance({ site: 1, volume: 0 });
      vm.waitForBarcodeOf('StockBatch');
      vm.barcodes = code ? StockBatchBarCode.createInstance({ code }) : [];
    }

    function processStockBatchBarcode({ code }) {
      return findStockBatch(code)
        .catch(e => {
          if (e === NOT_FOUND) {
            return saveDeep(vm.stockBatch)
              .then(() => createStockBatch(code));
          }
        });
    }

    function findArticle({ code, type }) {

      if (!code) {
        return;
      }

      if (!type || type.type !== 'Article') {
        toastr.error('Неправильный штрих-код');
        return;
      }

      return ArticleBarCode.findAll({ code })
        .then(res => _.first(res) || $q.reject('Not found'))
        .then(ab => ab.DSLoadRelations())
        .then(({ article }) => _.assign(vm, {
          article,
          lastCode: vm.barcode.code,
        }))
        .catch(() => toastr.error('Неизвестный штрих-код товара'));

    }

    function addBarcode({ code, type }) {

      if (!type) return;

      const save = vm.stockBatch.id ? $q.resolve(vm.stockBatch) : StockBatch.create(vm.stockBatch);

      return save
        .then(({ id: stockBatchId }) =>
          BarCodeScan.create({ destinationXid: stockBatchId, code })
            .then(scan => vm.barcodes.push(scan))
            .then(() => StockBatchItem.create({ stockBatchId, volume: 1, barcode: code }))
        )
        .catch(e => toastr.error(angular.toJson(e), 'Ошибка!'));

    }

    function waitForBarcodeOf(typeName) {

      vm.barcode = {};

      const processor = (() => {
        switch (typeName) {
          case BARCODE_TYPE_ARTICLE:
            return findArticle;
          case BARCODE_TYPE_STOCK_BATCH:
            return processStockBatchBarcode;
          case BARCODE_TYPE_EXCISE_STAMP:
            return addBarcode;
          default:
            return ({ code, type }) => toastr.error(code, `Штрих-код "${type.type}"`);
        }
      })();

      vm.watchScope('vm.barcode', function ({ code, type }) {

        if (!code) {
          return;
        }

        if (!type) {
          return toastr.error('Неизвестный тип штрих-кода', 'Ошибка');
        }

        if (typeName && type.type !== typeName) {
          const msg = `Неожиданный тип штрих-кода ${type.type}, ожидается ${typeName}`;
          return toastr.error(msg, 'Ошибка');
        }

        processor.apply(this, arguments);

      });

    }

  }

})();
