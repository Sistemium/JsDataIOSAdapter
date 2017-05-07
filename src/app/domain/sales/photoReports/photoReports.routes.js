'use strict';

(function () {

  angular.module('webPage')
    .config(function (stateHelperProvider) {

      stateHelperProvider
        .state({

          name: 'sales.photoReports',
          url: '/photoReports?outletId&campaignId',

          templateUrl: 'app/domain/sales/photoReports/PhotoReportList.html',
          controller: 'PhotoReportListController as vm',

          data: {
            title: 'Фотоотчёты'
          }

        });

    });

})();
