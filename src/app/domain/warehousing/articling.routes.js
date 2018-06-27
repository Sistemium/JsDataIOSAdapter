'use strict';

(function () {

  const barcodeScanner = {
    type: 'Article'
  };

  const articling = {

    name: 'wh.articling',
    url: '/articling',

    data: {
      rootState: 'wh.articling',
      title: 'Номенклатура',
      barcodeScanner,
    },

    template: '<warehouse-articling></warehouse-articling>',

    // children: []

  };

  angular.module('webPage')
    .config(stateHelperProvider => stateHelperProvider.state(articling));

})();
