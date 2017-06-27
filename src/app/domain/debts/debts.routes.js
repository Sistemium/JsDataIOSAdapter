'use strict';

(function () {

  angular.module('webPage')
    .config(function (stateHelperProvider) {

      stateHelperProvider

        .state({

          name: 'sales.cashing',
          url: '/cashing',

          templateUrl: 'app/domain/debts/Cashing.html',
          controller: 'CashingController as vm',

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

          templateUrl: 'app/domain/debts/DebtByOutlet.html',
          controller: 'DebtByOutletController as vm',

          data: {
            title: 'Долги по точкам',
            rootState: 'sales.debtByOutlet'
          },

          children:[
            {

              name: 'outletDebt',
              url: '/:outletId',
              templateUrl: 'app/domain/debts/OutletDebt.html',
              controller: 'OutletDebtController as vm',

              data: {
                disableSalesmanFilter: true
              }

            }
          ]

        });

    });

})();
