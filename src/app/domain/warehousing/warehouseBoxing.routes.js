'use strict';

(function () {

  const barcodeScanner = {
    // type: 'Article'
  };

  const warehouseBoxView = {
    name: 'view',
    url: '/view/:warehouseBoxId',

    data: {
      title: 'Коробка',
      watch: {
        ['vm.params.warehouseBoxId'](warehouseBoxId, { $state }) {
          if (warehouseBoxId) {
            $state.go('wh.warehouseBoxing.view', { warehouseBoxId })
          }
        },
      },
    },

    template: '<warehouse-box-info warehouse-box-id="vm.params.warehouseBoxId"></warehouse-box-info>',
    controller: 'StateController as vm',

  };

  const warehouseBoxCreate = {
    name: 'create',
    url: '/create?barcode',

    data: {
      title: 'Новая коробка',
      watch: {
        ['vm.warehouseBoxId'](warehouseBoxId, { $state }) {
          if (warehouseBoxId) {
            $state.go('wh.warehouseBoxing.view', { warehouseBoxId })
          }
        },
      },
    },

    template: '<warehouse-box-create ' +
    'barcode="vm.params.barcode" warehouse-box-id="vm.warehouseBoxId">' +
    '</warehouse-box-create>',
    controller: 'StateController as vm',

  };

  const warehousePaletteView = {
    name: 'palette',
    url: '/palette/:warehousePaletteId',

    data: {
      title: 'Палета',
      watch: {
        ['vm.params.warehousePaletteId'](warehousePaletteId, { $state }) {
          if (warehousePaletteId) {
            $state.go('wh.warehouseBoxing.palette', { warehousePaletteId })
          }
        },
      },
    },

    template: '<warehouse-palette-info warehouse-palette-id="vm.params.warehousePaletteId">' +
      '</warehouse-palette-info>',
    controller: 'StateController as vm',

  };

  const warehouseBoxing = {

    name: 'wh.warehouseBoxing',
    url: '/warehouseBoxing',

    data: {
      rootState: 'wh.warehouseBoxing',
      title: 'Коробки',
      barcodeScanner,
    },

    template: '<warehouse-boxing></warehouse-boxing>',

    children: [warehouseBoxView, warehouseBoxCreate, warehousePaletteView]

  };

  angular.module('webPage')
    .config(stateHelperProvider => stateHelperProvider.state(warehouseBoxing));

})();
