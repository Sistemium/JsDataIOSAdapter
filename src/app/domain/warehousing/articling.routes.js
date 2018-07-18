'use strict';

(function () {

  const barcodeScanner = {
    // type: 'Article'
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

    children: [{
      name: 'view',
      url: '/view/:articleId',
      data: {
        // title: 'Номенклатура',
      },
      template: '<warehouse-article-view ng-model="vm.params.articleId"></warehouse-article-view>',
      controller: 'StateController as vm',
    }]

  };

  angular.module('webPage')
    .config(stateHelperProvider => stateHelperProvider.state(articling));

})();
