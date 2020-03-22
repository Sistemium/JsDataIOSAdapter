(function () {

  angular.module('Warehousing')
    .component('warehouseBoxing', {

      bindings: {},

      controller: warehouseBoxingController,

      templateUrl: 'app/domain/warehousing/warehouseBoxing/warehouseBoxing.html',
      controllerAs: 'vm',

    });

  // const NOT_FOUND = 'NOT_FOUND';

  /** @ngInject */
  function warehouseBoxingController(Schema, saControllerHelper, $scope, WarehouseBoxing,
                                     $state, $q, BarCodeScanner, DEBUG) {

    const {
      BarCodeType
    } = Schema.models();

    const {
      // BARCODE_TYPE_ARTICLE,
      BARCODE_TYPE_STOCK_BATCH,
      BARCODE_TYPE_WAREHOUSE_BOX,
      BARCODE_TYPE_EXCISE_STAMP,
      BARCODE_TYPE_WAREHOUSE_PALETTE,
    } = BarCodeType.meta.types;

    const { BARCODE_SCAN_EVENT } = BarCodeScanner;

    const vm = saControllerHelper.setup(this, $scope).use({

      $onInit() {

        const { warehouseBoxId } = $state.params;

        if (warehouseBoxId) {
          WarehouseBoxing.findBoxById(warehouseBoxId)
            .catch(() => {
              WarehouseBoxing.replyNotFound();
              WarehouseBoxing.goState();
            });
        }

        $scope.$on(BARCODE_SCAN_EVENT, (e, { code, type }) => code && onScan(code, type));
      },

      $onDestroy() {
        WarehouseBoxing.clearCache();
      },

      onScan,

    });

    /*
    Functions
     */

    function stateName() {

      const { currentState } = vm;

      switch (currentState) {
        case 'warehouseBoxing':
          return 'root';
        case 'palette':
        case 'create':
        case 'view':
          return currentState;

      }

    }

    let scanBusy = false;

    function onScan(code, type = {}) {

      if (scanBusy) {
        return WarehouseBoxing.replyBusy();
      }

      const barcodeType = type.type;

      DEBUG('onScan', code, barcodeType);

      switch (barcodeType) {
        case BARCODE_TYPE_STOCK_BATCH:
          scanBusy = onStockBatchScan(code);
          break;
        case BARCODE_TYPE_WAREHOUSE_PALETTE:
          scanBusy = onPaletteScan(code);
          break;
        case BARCODE_TYPE_EXCISE_STAMP:
          scanBusy = onStampScan(code);
          break;
        case BARCODE_TYPE_WAREHOUSE_BOX:
          scanBusy = onWarehouseBoxScan(code);
          break;
        default:
          return WarehouseBoxing.replyInvalidType();
      }

      return vm.setBusy(scanBusy.finally(() => scanBusy = false));

    }

    function onStockBatchScan(barcode) {
      return WarehouseBoxing.findStockBatchByBarcode(barcode)
        .then(sb => {
          if (!sb) {
            return WarehouseBoxing.replyNotFound();
          }
          WarehouseBoxing.pushStockBatch(sb);
        });
    }

    function onPaletteScan(barcode) {
      return WarehouseBoxing.findPaletteByBarcode(barcode)
        .then(palette => {

          if (palette) {
            return WarehouseBoxing.goPaletteInfo(palette);
          } else {
            // return WarehouseBoxing.goState('.create', { barcode });
            WarehouseBoxing.replyNotFound();
          }

        })
        .catch(e => {
          console.error(e);
          WarehouseBoxing.replyNotConnected();
        });
    }

    function onWarehouseBoxScan(barcode) {

      return WarehouseBoxing.findBoxByBarcode(barcode)
        .then(box => {

          if (box) {
            return WarehouseBoxing.goBoxInfo(box);
          } else {
            return WarehouseBoxing.goState('.create', { barcode });
          }

        })
        .catch(e => {
          console.error(e);
          WarehouseBoxing.replyNotConnected();
        });

    }

    function checkIfGatheringStamps(barcode) {
      if (barcode.length > WarehouseBoxing.OLD_STAMP_LENGTH) {
        return WarehouseBoxing.replyNotFound();
      }
      if (stateName() !== 'create') {
        return WarehouseBoxing.replyError('Неизвестные марки можно только в новую коробку');
      }
      WarehouseBoxing.pushPlainStamp(barcode);
    }

    function onStampScan(barcode) {

      return WarehouseBoxing.findItemByBarcode(barcode)
        .then(warehouseItem => {

          if (!warehouseItem) {
            return checkIfGatheringStamps(barcode);
          }

          switch (stateName()) {
            case 'root': {

              const { currentBoxId } = warehouseItem;

              if (!currentBoxId) {
                return WarehouseBoxing.replyNoBox();
              }

              return WarehouseBoxing.goBoxInfo({ id: currentBoxId })
                .then(() => WarehouseBoxing.pushWarehouseItem(warehouseItem));

            }
            case 'palette':
              return;

            default:
              return WarehouseBoxing.pushWarehouseItem(warehouseItem);

          }

        });

    }

  }

})();
