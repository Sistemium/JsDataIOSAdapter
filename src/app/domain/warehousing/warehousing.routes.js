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
      url: '/view/:stockTakingId',
      template: '<stock-taking-view ' +
      'ng-model="vm.params.stockTakingId" ' +
      'item-id="vm.params.stockTakingItemId"' +
      '></stock-taking-view>',
      controller: 'StateController as vm',
      data: {
        rootState: 'wh.stockTaking',
        watch: {
          ['vm.params.stockTakingItemId'](stockTakingItemId, $state) {
            if (stockTakingItemId) {
              $state.go('wh.stockTaking.view.item', { stockTakingItemId })
            } else {
              $state.go('wh.stockTaking.view')
            }
          }
        },
      },

      children: [{
        name: 'item',
        url: '/:stockTakingItemId',
        controller: 'StateController as vm',
        template: '<stock-taking-item-view ng-model="vm.params.stockTakingItemId"></stock-taking-item-view>',
        data: {
          on: {
            ['stock-taking-item-destroy'](stockTakingItem, $state) {
              $state.go('^');
            },
          }
        }
      }]

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
