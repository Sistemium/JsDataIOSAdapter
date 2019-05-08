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
      BARCODE_TYPE_WAREHOUSE_BOX,
      BARCODE_TYPE_EXCISE_STAMP,
    } = BarCodeType.meta.types;

    const { BARCODE_SCAN_EVENT } = BarCodeScanner;

    const vm = saControllerHelper.setup(this, $scope).use({

      $onInit() {

        const { warehouseBoxId } = $state.params;

        if (warehouseBoxId) {
          loadBox((warehouseBoxId))
            .catch(() => {
              WarehouseBoxing.replyNotFound();
              WarehouseBoxing.goState();
            });
        }

        $scope.$on(BARCODE_SCAN_EVENT, (e, { code, type }) => code && onScan(code, type));
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

      if (stateName() === 'create' && barcodeType === BARCODE_TYPE_EXCISE_STAMP) {
        return $scope.$broadcast('WarehouseBoxing.create.scan.stamp', code);
      }

      if (barcodeType === BARCODE_TYPE_WAREHOUSE_BOX) {

        scanBusy = true;

        return onWarehouseBoxScan(code)
          .finally(() => {
            scanBusy = false;
          });

      }

      return WarehouseBoxing.replyInvalidType();

    }

    function onWarehouseBoxScan(barcode) {

      return WarehouseBoxing.findBoxByBarcode(barcode)
        .then(box => {

          if (box) {
            return WarehouseBoxing.goBoxInfo(box);
          } else {
            return WarehouseBoxing.goState('.create', { barcode });
            // return WarehouseBoxing.replyNotFound();
          }

        })
        .catch(e => {
          console.error(e);
          WarehouseBoxing.replyNotConnected();
        });

    }

    function loadBox(id) {

      return WarehouseBoxing.findBoxById(id);

    }

  }

})();
