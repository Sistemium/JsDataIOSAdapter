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
  function warehouseBoxingController(Schema, saControllerHelper, $scope,
                                     toastr, $state, $q, BarCodeScanner, DEBUG) {

    const {
      WarehouseBox,
      BarCodeType
    } = Schema.models();

    const {
      // BARCODE_TYPE_ARTICLE,
      BARCODE_TYPE_WAREHOUSE_BOX,
      // BARCODE_TYPE_EXCISE_STAMP,
    } = BarCodeType.meta.types;

    const { BARCODE_SCAN_EVENT } = BarCodeScanner;

    const vm = saControllerHelper.setup(this, $scope).use({

      $onInit() {

        const { warehouseBoxId } = $state.params;

        if (warehouseBoxId) {
          loadBox((warehouseBoxId))
            .catch(() => {
              toastr.error('Этой партии не существует', warehouseBoxId);
              goState();
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

    function rootState() {
      return stateName() === 'root';
    }


    function goState(name, params) {

      return $state.go(`wh.warehouseBoxing${name || ''}`, params);

    }

    function onScan(code, type = {}) {

      const barcodeType = type.type;

      DEBUG('onScan', code, barcodeType);

      if (rootState()) {
        if (barcodeType !== BARCODE_TYPE_WAREHOUSE_BOX) {
          return toastr.error('Это не штрих-код наклейки', code);
        }
      }

      return onWarehouseBoxScan(code);

    }

    function onWarehouseBoxScan(barcode) {

      return WarehouseBox.findAll({ barcode }, { bypassCache: true })
        .then(_.first)
        .then(box => {

          if (box) {
            return loadBox(box.id)
              .then(() => {
                goState('.view', { warehouseBoxId: box.id });
              })
          } else {
            return goState('.create', { barcode });
          }

        });

    }

    function loadBox(id) {

      return WarehouseBox.find(id)
        .then(box => box.DSLoadRelations(['warehouseArticle', 'currentItems']));

    }

  }

})();
