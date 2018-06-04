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

          children: [stockBatching, stockTaking]

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

  const stockTaking = {

    name: 'stockTaking',
    url: '/stockTaking',

    data: {
      title: 'Инвентаризация',
    },

    template: '<stock-taking></stock-taking>',

    children: [{
      name: 'view',
      url: '/view/:stockTakingId?stockTakingItemId',
      template: '<p>{{ vm.params.stockTakingItemId }}</p><stock-taking-view ' +
      'ng-model="vm.params.stockTakingId" ' +
      'item-id="vm.params.stockTakingItemId"' +
      '></stock-taking-view>',
      controller: 'StateController as vm',
      data: {
        rootState: 'wh.stockTaking',
        watch: {
          ['vm.params.stockTakingItemId'](stockTakingItemId, $state) {
            $state.go('.', { stockTakingItemId }, { notify: true, inherit: true })
          }
        },
      },

    }, {
      name: 'create',
      url: '/create',
      template: '<stock-taking-view></stock-taking-view>',
      data: {
        rootState: 'wh.stockTaking',
      },
    },],

  };

})();
