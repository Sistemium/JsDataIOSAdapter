(function () {

  angular.module('Warehousing')
    .component('warehouseBoxView', {

      bindings: {
        warehouseBoxId: '=',
        createCode: '<barcode',
      },

      controller: warehouseBoxViewController,

      templateUrl: 'app/domain/warehousing/warehouseBoxing/view/warehouseBoxView.html',
      controllerAs: 'vm',

    });

  const NOT_FOUND = 'NOT_FOUND';
  const NOT_UNIQUE = 'NOT_UNIQUE';

  // const ALREADY_EXISTS = 'ALREADY_EXISTS';

  /** @ngInject */
  function warehouseBoxViewController(saControllerHelper, $scope, $q,
                                      Schema, BarCodeScanner, toastr) {

    const vm = saControllerHelper.setup(this, $scope);
    const { BARCODE_SCAN_EVENT } = BarCodeScanner;
    const {
      WarehouseBox,
      WarehouseItem,
      // WarehouseBoxOperation,
      WarehouseArticle,
      BarCodeType,
    } = Schema.models();
    const {
      BARCODE_TYPE_ARTICLE,
      BARCODE_TYPE_WAREHOUSE_BOX,
      BARCODE_TYPE_EXCISE_STAMP,
    } = BarCodeType.meta.types;

    vm.use({

      $onInit() {

        const { warehouseBoxId, createCode } = vm;
        const orderBy = [['timestamp', 'DESC']];

        vm.lastBarcode = createCode;

        if (warehouseBoxId) {
          vm.rebindOne(WarehouseBox, warehouseBoxId, 'vm.stockBatch');
          vm.rebindAll(WarehouseItem, { currentBoxId: warehouseBoxId, orderBy }, 'vm.stockBatchItems');
        } else {
          vm.stockBatch = newStockBatch(createCode);
        }

        $scope.$on(BARCODE_SCAN_EVENT, (e, scan) => vm.onScan(scan));

      },

      onScan,

      readyToScanArticle() {
        const { stockBatch, createCode } = vm;
        return stockBatch && !stockBatch.id && createCode && !stockBatch.warehouseArticleId
      },

      readyToScanItem() {
        const { stockBatch } = vm;
        return stockBatch && stockBatch.warehouseArticleId;
      },

      setArticleClick: setArticle,

    });

    function setArticle({ id } = {}) {
      if (!id) {
        return;
      }
      vm.articles = null;
      vm.stockBatch.warehouseArticleId = id;
    }

    function isCreating() {
      return !_.get(vm, 'stockBatch.id');
    }

    function onScan({ code, type: barCodeType = {} }) {

      console.warn('warehouseBoxView', vm.currentState, code, barCodeType);

      const { type } = barCodeType;

      if (!type) {
        return;
      }

      $q.when(processScan(code, type))
        .then(() => vm.lastBarcode = code);

    }

    function processScan(code, type) {

      const { stockBatch } = vm;

      if (type === BARCODE_TYPE_WAREHOUSE_BOX) {
        return isCreating();
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
        processing: 'draft',
      });

      return stockBatch.DSCreate();
      // .then(({ id: warehouseBoxId }) => {
      //   const codesToSave = _.filter(vm.stockBatchBarCodes, item => !item.id);
      //   const promises = _.map(codesToSave, item => _.assign(item, { warehouseBoxId }).DSCreate());
      //   return $q.all(promises)
      //     .then(() => stockBatch);
      // });
    }

    function now() {
      return moment().utc().format('YYYY-MM-DD HH:mm:ss.SSS');
    }

    function addItemByCode(barcode) {

      const existing = _.find(vm.stockBatchItems, { barcode });

      if (existing) {
        existing.timestamp = now();
        // TODO: save confirmation info
        toastr.info('Эта марка уже привязана к партии');
        return existing.DSCreate();
      }

      return WarehouseItem.findAll({ barcode }, { bypassCache: true })
        .then(res => {

          if (res.length) {
            return toastr.error('Эта марка принадлежит другой партии');
          }

          return saveStockBatch()
            .then(({ id: warehouseBoxId, warehouseArticleId }) =>
              WarehouseItem.create({ barcode, currentBoxId: warehouseBoxId, warehouseArticleId })
            )
            .then(({ currentBoxId }) => {
              vm.warehouseBoxId = currentBoxId;
            });

        });

    }

    function setArticleByBarcode(barcode) {

      const where = {
        barcodes: {
          likei: `%"${barcode}"%`,
        }
      };

      return WarehouseArticle.findAll({ where }, { bypassCache: true })
        .then(res => {

          if (!res.length) {
            return $q.reject(NOT_FOUND);
          }

          if (res.length > 1) {
            return chooseArticle(res)
              .then(() => $q.reject(NOT_UNIQUE));
          }

          return _.first(res);

        });

    }

    function chooseArticle(articles) {
      vm.articles = articles;
    }

    function newStockBatch(barcode) {

      vm.stockBatchItems = [];

      return WarehouseBox.createInstance({ barcode, processing: 'draft' });

    }


  }

})();
