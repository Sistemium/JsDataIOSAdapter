'use strict';

(function () {

  angular.module('webPage')
    .config(function (stateHelperProvider) {

      stateHelperProvider
        .state({

          name: 'sales.debtByOutlet',
          url: '/debt/byOutlet',

          templateUrl: 'app/domain/debts/DebtByOutlet.html',
          controller: 'DebtByOutletController as vm',

          data: {
            title: 'Долги по точкам'
          },

          children:[
            {
              name: 'outletDebt',
              url: '/:outletId',
              templateUrl: 'app/domain/debts/OutletDebt.html',
              controller: 'OutletDebtController as vm'
            }
          ]

        });

    });

})();
