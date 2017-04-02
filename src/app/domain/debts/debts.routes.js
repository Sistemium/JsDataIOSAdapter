'use strict';

(function () {

  angular.module('webPage')
    .config(function (stateHelperProvider) {

      stateHelperProvider
        .state({

          name: 'sales.debtByOutlet',
          url: '/debt/byOutlet',

          templateUrl: 'app/domain/debts/DebtByOutlet.html',
          controller: 'DebtByOutletController',
          controllerAs: 'vm',

          data: {
            title: 'Долги по точкам'
          }

        });

    });

})();
