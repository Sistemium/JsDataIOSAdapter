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
        const orderBy = [['timestamp', 'DESC']];

        vm.lastBarcode = createCode;

        if (stockBatchId) {
          vm.rebindOne(StockBatch, vm.stockBatchId, 'vm.stockBatch');
          vm.rebindAll(StockBatchBarCode, { stockBatchId }, 'vm.stockBatchBarCodes');
          vm.rebindAll(StockBatchItem, { stockBatchId, orderBy }, 'vm.stockBatchItems');
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

      setArticleClick: setArticle,

    });

    function setArticle({ id } = {}) {
      if (!id) {
        return;
      }
      vm.articles = null;
      vm.stockBatch.articleId = id;
    }

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
          .then(setArticle)
          .catch(err => {
            switch (err) {
              case NOT_FOUND:
                return toastr.error('Неизвестный товар', code);
              case NOT_UNIQUE:
                return toastr.info('Выберите товар', code);
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
        volume: vm.stockBatchItems.length || 0,
      });

      return stockBatch.DSCreate()
        .then(({ id: stockBatchId }) => {
          const codesToSave = _.filter(vm.stockBatchBarCodes, item => !item.id);
          const promises = _.map(codesToSave, item => _.assign(item, { stockBatchId }).DSCreate());
          return $q.all(promises)
            .then(() => stockBatch);
        });
    }

    function now() {
      return moment().utc().format('YYYY-MM-DD HH:mm:ss.SSS');
    }

    function addItemByCode(barcode) {

      const existing = _.find(vm.stockBatchItems, { barcode });

      if (existing) {
        existing.timestamp = now();
        toastr.info('Эта марка уже привязана к партии');
        return existing.DSCreate();
      }

      return StockBatchItem.findAll({ barcode }, { bypassCache: true })
        .then(res => {

          if (res.length) {
            return toastr.error('Эта марка принадлежит другой партии');
          }

          return saveStockBatch()
            .then(({ id: stockBatchId }) =>
              StockBatchItem.create({
                stockBatchId,
                barcode,
                volume: 1,
                timestamp: now(),
              })
            )
            .then(({ stockBatchId }) => {
              vm.stockBatchId = stockBatchId;
            });

        });

    }

    function setArticleByBarcode(code) {

      return ArticleBarCode.findAll({ code }, { bypassCache: true })
        .then(res => {

          if (!res.length) {
            return $q.reject(NOT_FOUND);
          }

          if (res.length > 1) {
            return chooseArticle(res)
              .then(() => $q.reject(NOT_UNIQUE));
          }

          const { articleId } = res[0];

          return Article.find(articleId);

        });

    }

    function chooseArticle(articleBarCodes) {

      const where = {
        id: {
          in: _.uniq(articleBarCodes.map(item => item.articleId))
        },
      };

      return Article.findAll({ where }, { bypassCache: true })
        .then(res => vm.articles = res);
    }

    function addStockBatchBarCode(code) {

      if (!isCreating()) {
        return;
      }

      if (_.find(vm.stockBatchBarCodes, { code })) {
        toastr.info('Эта наклейка уже привязана к партии', code);
        return $q.resolve(ALREADY_EXISTS);
      }

      return StockBatchBarCode.findAll({ code }, { bypassCache: true })
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

      vm.stockBatchItems = [];
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
