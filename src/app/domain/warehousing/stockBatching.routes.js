'use strict';

(function () {

  const barcodeScanner = {
    // type: 'Article'
  };

  const stockBatching = {

    name: 'wh.stockBatching',
    url: '/stockBatching',

    data: {
      title: 'Товарные партии',
      barcodeScanner,
    },

    template: '<stock-batching></stock-batching>'

  };

  angular.module('webPage')
    .config(stateHelperProvider => stateHelperProvider.state(stockBatching));

})();
