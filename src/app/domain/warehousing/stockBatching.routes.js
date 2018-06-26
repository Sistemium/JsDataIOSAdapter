'use strict';

(function () {

  const barcodeScanner = {
    // type: 'Article'
  };

  const stockBatchView = {
    name: 'view',
    url: '/view/:stockBatchId',

    data: {
      title: 'Товарная партия',
      watch: {
        ['vm.params.stockBatchId'](stockBatchId, { $state }) {
          if (stockBatchId) {
            $state.go('wh.stockBatching.view', { stockBatchId })
          }
        },
      },
    },

    template: '<stock-batch-view ng-model="vm.params.stockBatchId"></stock-batch-view>',
    controller: 'StateController as vm',

  };

  const stockBatchCreate = {
    name: 'create',
    url: '/create?code',

    data: {
      title: 'Новая партия',
      watch: {
        ['vm.stockBatchId'](stockBatchId, { $state }) {
          if (stockBatchId) {
            $state.go('wh.stockBatching.view', { stockBatchId })
          }
        },
      },
    },

    template: '<stock-batch-view ' +
    'code="vm.params.code" ng-model="vm.stockBatchId">' +
    '</stock-batch-view>',
    controller: 'StateController as vm',

  };

  const stockBatching = {

    name: 'wh.stockBatching',
    url: '/stockBatching',

    data: {
      rootState: 'wh.stockBatching',
      title: 'Товарные партии',
      barcodeScanner,
    },

    template: '<stock-batching></stock-batching>',

    children: [stockBatchView, stockBatchCreate]

  };

  angular.module('webPage')
    .config(stateHelperProvider => stateHelperProvider.state(stockBatching));

})();
