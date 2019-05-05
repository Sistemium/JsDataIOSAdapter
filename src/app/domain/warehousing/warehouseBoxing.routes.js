'use strict';

(function () {

  const barcodeScanner = {
    // type: 'Article'
  };

  const warehouseBoxView = {
    name: 'view',
    url: '/view/:warehouseBoxId',

    data: {
      title: 'Товарная партия',
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
      title: 'Новая партия',
      watch: {
        ['vm.warehouseBoxId'](warehouseBoxId, { $state }) {
          if (warehouseBoxId) {
            $state.go('wh.warehouseBoxing.view', { warehouseBoxId })
          }
        },
      },
    },

    template: '<warehouse-box-view ' +
    'barcode="vm.params.barcode" warehouse-box-id="vm.warehouseBoxId">' +
    '</warehouse-box-view>',
    controller: 'StateController as vm',

  };

  const warehouseBoxing = {

    name: 'wh.warehouseBoxing',
    url: '/warehouseBoxing',

    data: {
      rootState: 'wh.warehouseBoxing',
      title: 'Товарные партии',
      barcodeScanner,
    },

    template: '<warehouse-boxing></warehouse-boxing>',

    children: [warehouseBoxView, warehouseBoxCreate]

  };

  angular.module('webPage')
    .config(stateHelperProvider => stateHelperProvider.state(warehouseBoxing));

})();
