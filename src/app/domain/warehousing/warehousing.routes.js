'use strict';

(function () {

  angular.module('webPage')
    .config(stateHelperProvider => {

      stateHelperProvider
        .state({

          name: 'wh',
          abstract: true,
          templateUrl: 'app/domain/ui-view.html',

          data: {
            // auth: 'SalesmanAuth'
          },

          children: [stockBatching]

        });

      console.warn('init');

    });

  const stockBatching = {

    name: 'stockBatching',
    url: '/stockBatching',

    template: '<stock-batch-view></stock-batch-view>'

  };

})();
