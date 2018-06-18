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
            // TODO: warehousing auth service
            // auth: 'SalesmanAuth'
          },

          children: [stockBatching, warehouses]

        });

    });

  const stockBatching = {

    name: 'stockBatching',
    url: '/stockBatching',

    data: {
      title: 'Товарные партии',
    },

    template: '<stock-batching></stock-batching>'

  };

  const warehouses = {

    name: 'warehouses',
    url: '/warehouses',

    data: {
      title: 'Склады',
    },

    template: '<warehouse-list></warehouse-list>'

  };

})();
