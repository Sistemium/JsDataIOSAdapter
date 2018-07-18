'use strict';

(function () {

  angular.module('webPage')
    .config(stateHelperProvider => stateHelperProvider.state(stockTaking));

  const LS_KEY = 'stockTaking.tab';

  const barcodeScanner = {
    type: 'Article'
  };

  const stockTaking = {

    name: 'wh.stockTaking',
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
      'item-id="vm.params.stockTakingItemId" ' +
      'tab="vm.locals.tab"' +
      '></stock-taking-view>',

      controller: 'StateController as vm',

      data: {

        barcodeScanner,
        rootState: 'wh.stockTaking',

        watch: {
          ['vm.params.stockTakingItemId'](stockTakingItemId, { $state }) {
            if (stockTakingItemId) {
              $state.go('wh.stockTaking.view.item', { stockTakingItemId })
            } else {
              $state.go('wh.stockTaking.view')
            }
          },
          ['vm.locals.tab'](tab, { localStorageService }) {
            localStorageService.set(LS_KEY, tab);
          },
        },

        initLocals(locals, { localStorageService }) {
          locals.tab = localStorageService.get(LS_KEY);
        },

      },

      children: [{

        name: 'item',
        url: '/:stockTakingItemId',
        template: '<stock-taking-item-view ' +
        'ng-model="vm.params.stockTakingItemId"' +
        '></stock-taking-item-view>',

        controller: 'StateController as vm',

        data: {
          watch: {
            ['vm.params.stockTakingItemId'](stockTakingItemId, { $state }) {
              if (stockTakingItemId) {
                $state.go('wh.stockTaking.view.item', { stockTakingItemId })
              } else {
                $state.go('wh.stockTaking.view')
              }
            },
          },
          on: {
            ['stock-taking-item-destroy'](stockTakingItem, { $state }) {
              $state.go('^');
            },
          }
        }

      }]

    }, {

      name: 'create',
      url: '/create',
      template: '<stock-taking-view tab="vm.locals.tab"></stock-taking-view>',

      controller: 'StateController as vm',

      data: {

        barcodeScanner,
        rootState: 'wh.stockTaking',

        initLocals(locals, { localStorageService }) {
          locals.tab = localStorageService.get(LS_KEY);
        },

      },

    },],

  };

})();
