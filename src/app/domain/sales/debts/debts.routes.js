'use strict';

(function () {

  angular.module('webPage')
    .config(function (stateHelperProvider) {

      stateHelperProvider

        .state({

          name: 'sales.cashing',
          url: '/cashing',

          templateUrl: 'app/domain/sales/debts/Cashing.html',
          controller: 'CashingController',
          controllerAs: 'vm',

          data: {
            title: 'Выручка',
            hideSalesmanFilter: true
          },

          children: [
            {
              name: 'uncashing',
              url: '/uncashing'
            }, {
              name: 'uncashed',
              url: '/:uncashingId'
            }
          ]

        })

        .state({

          name: 'sales.debtByOutlet',
          url: '/debt/byOutlet',

          template: '<debt-view class="debt-by-outlet"></debt-view>',

          data: {
            title: 'Долги по точкам',
            rootState: 'sales.debtByOutlet'
          },

          children: [
            {

              name: 'outletDebt',
              url: '/:outletId',
              template: '<debt-view-by-outlet disable-elements="false"></debt-view-by-outlet>',

              data: {
                title: 'Долги в точке',
                disableSalesmanFilter: true
              },

              children: [
                {

                  name: 'cashing',
                  url: '/cashing',
                  templateUrl: 'app/domain/sales/debts/OutletCashing.html',
                  controller: 'OutletCashingController as vm',

                  data: {
                    title: 'Выручка в точке',
                    disableSalesmanFilter: true
                  }

                }
              ]

            }
          ]

        });

    });

})();
