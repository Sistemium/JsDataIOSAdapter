'use strict';

(function () {

  angular.module('webPage')
    .config(function (stateHelperProvider) {

      stateHelperProvider

        .state({

          name: 'sales.perfectShopReport',
          url: '/perfectShopReport',

          template: '<perfect-shop-report></perfect-shop-report>',

          data: {
            // settings: 'perfectShopReport',
            title: 'Отчет про Perfect Shop',
            rootState: 'sales.perfectShopReport'
          },

          children: [
            {

              name: 'outletPerfectShop',
              url: '/:statId',
              template: '<outlet-perfect-shop stat-id="vm.params.statId"></outlet-perfect-shop>',
              controller: 'StateController as vm',

              data: {
                title: 'Perfect Shop в точке',
                disableSalesmanFilter: true,
                watch: {
                  ['vm.params.statId'](statId, { $state }) {
                    if (statId) {
                      $state.go('sales.perfectShopReport.outletPerfectShop', { statId });
                    }
                  },
                },
              },

            }
          ],

        });

    });

})();
