'use strict';

(function () {

  angular.module('webPage')
    .config(function (stateHelperProvider) {

      stateHelperProvider
        .state({

          name: 'sales.photoReports',
          url: '/photoReports?outletId&campaignId',

          templateUrl: 'app/domain/sales/photoReports/photoReports.html',
          controller: 'PhotoReportsController',
          controllerAs: 'vm',

          data: {
            title: 'Фотоотчёты'
          }

        });

    });

})();
