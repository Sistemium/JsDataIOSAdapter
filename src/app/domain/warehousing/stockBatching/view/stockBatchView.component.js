(function () {

  angular.module('Warehousing')
    .component('stockBatchView', {

      bindings: {
        stockBatchId: '=ngModel',
        createCode: '<code',
      },

      controller: StockBatchViewController,

      templateUrl: 'app/domain/warehousing/stockBatching/view/stockBatchView.html',
      controllerAs: 'vm',

    });

  const NOT_FOUND = 'NOT_FOUND';
  const NOT_UNIQUE = 'NOT_UNIQUE';
  const ALREADY_EXISTS = 'ALREADY_EXISTS';

  /** @ngInject */
  function StockBatchViewController(saControllerHelper, $scope, $q,
                                    Schema, BarCodeScanner, toastr) {

    const vm = saControllerHelper.setup(this, $scope);
    const { BARCODE_SCAN_EVENT } = BarCodeScanner;
    const {
      StockBatch,
      StockBatchBarCode,
      StockBatchItem,
      ArticleBarCode,
      Article,
      BarCodeType,
    } = Schema.models();
    const {
      BARCODE_TYPE_ARTICLE,
      BARCODE_TYPE_STOCK_BATCH,
      BARCODE_TYPE_EXCISE_STAMP,
    } = BarCodeType.meta.types;

    vm.use({

      $onInit() {

        const { stockBatchId, createCode } = vm;

        vm.lastBarcode = createCode;

        if (stockBatchId) {
          vm.rebindOne(StockBatch, vm.stockBatchId, 'vm.stockBatch');
          vm.rebindAll(StockBatchBarCode, { stockBatchId }, 'vm.stockBatchBarCodes');
        } else {
          vm.stockBatch = newStockBatch(createCode);
        }

        $scope.$on(BARCODE_SCAN_EVENT, (e, scan) => vm.onScan(scan));

      },

      onScan,

      readyToScanArticle() {
        const { stockBatch, createCode } = vm;
        return stockBatch && !stockBatch.id && createCode && !stockBatch.articleId
      },

      readyToScanItem() {
        const { stockBatch, stockBatchBarCodes } = vm;
        return stockBatch && stockBatch.articleId && stockBatchBarCodes.length
      },

    });

    function isCreating() {
      return !_.get(vm, 'stockBatch.id');
    }

    function onScan({ code, type: barCodeType = {} }) {

      console.warn('stockBatchView', vm.currentState, code, barCodeType);

      const { type } = barCodeType;

      if (!type) {
        return;
      }

      $q.when(processScan(code, type))
        .then(() => vm.lastBarcode = code);

    }

    function processScan(code, type) {

      const { stockBatch } = vm;

      if (type === BARCODE_TYPE_STOCK_BATCH) {
        return isCreating() && addStockBatchBarCode(code);
      }

      if (type !== BARCODE_TYPE_ARTICLE && vm.readyToScanArticle()) {
        return toastr.error('Это не штрих-код товара', code);
      }

      if (type === BARCODE_TYPE_ARTICLE && !stockBatch.id) {
        return setArticleByBarcode(code)
          .then(article => {
            stockBatch.articleId = article.id;
          })
          .catch(err => {
            switch (err) {
              case NOT_FOUND:
                return toastr.error('Неизвестный товар', code);
              case NOT_UNIQUE:
                return toastr.error('Товаров с таким штрих-кодом больше одного', code);
              default:
                return toastr.error(angular.toJson(err), code);
            }
          });
      }

      if (type === BARCODE_TYPE_EXCISE_STAMP && vm.readyToScanItem()) {
        return addItemByCode(code);
      }

    }

    function saveStockBatch() {

      const { stockBatch } = vm;

      _.assign(stockBatch, {
        volume: stockBatch.id ? stockBatch.items.length : 1,
      });

      return stockBatch.DSCreate()
        .then(({ id: stockBatchId }) => {
          const codesToSave = _.filter(vm.stockBatchBarCodes, item => !item.id);
          const promises = _.map(codesToSave, item => _.assign(item, { stockBatchId }).DSCreate());
          return $q.all(promises)
            .then(() => stockBatch);
        });
    }

    function addItemByCode(barcode) {

      if (_.find(vm.stockBatchItems, { barcode })) {
        toastr.info('Эта марка уже привязана к партии');
        return $q.resolve(ALREADY_EXISTS);
      }

      return StockBatchItem.findAll({ barcode })
        .then(res => {

          if (res.length) {
            return toastr.error('Эта марка принадлежит другой партии');
          }

          return saveStockBatch()
            .then(({ id: stockBatchId }) =>
              StockBatchItem.create({ stockBatchId, barcode, volume: 1 })
            )
            .then(({ stockBatchId }) => {
              vm.stockBatchId = stockBatchId;
            });

        });

    }

    function setArticleByBarcode(code) {

      return ArticleBarCode.findAll({ code })
        .then(res => {

          if (!res.length) {
            return $q.reject(NOT_FOUND);
          }

          if (res.length > 1) {
            return $q.reject(NOT_UNIQUE);
          }

          const { articleId } = res[0];

          return Article.find(articleId);

        });

    }

    function addStockBatchBarCode(code) {

      if (!isCreating()) {
        return;
      }

      if (_.find(vm.stockBatchBarCodes, { code })) {
        toastr.info('Эта наклейка уже привязана к партии', code);
        return $q.resolve(ALREADY_EXISTS);
      }

      return StockBatchBarCode.findAll({ code })
        .then(_.first)
        .then(({ stockBatchId }) => {

          if (stockBatchId) {

            if (vm.lastBarcode === code) {
              vm.stockBatchId = stockBatchId;
              return;
            }

            return toastr.error('Эта наклейка принадлежит другой партии', code);
          }

          vm.stockBatchBarCodes.push(StockBatchBarCode.createInstance({ code }))

        });

    }

    function newStockBatch() {

      vm.stockBatchBarCodes = initStockBatchBarCodes();

      return StockBatch.createInstance();

    }

    function initStockBatchBarCodes() {

      const { stockBatch = {}, createCode: code } = vm;

      if (stockBatch.id) {
        return stockBatch.stockBatchBarCodes;
      } else if (code) {
        const stockBatchBarCode = StockBatchBarCode.createInstance({ code });
        return [stockBatchBarCode];
      }

      return [];

    }

  }

})();
