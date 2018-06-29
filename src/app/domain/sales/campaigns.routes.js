'use strict';

(function () {

  angular.module('webPage')
    .config(function (stateHelperProvider) {

      stateHelperProvider
        .state({

          name: 'sales.campaigns',
          url: '/campaigns?campaignGroupId',

          templateUrl: 'app/domain/sales/campaigns/campaigns.html',
          controller: 'CampaignsController',
          controllerAs: 'vm',

          data: {
            title: 'Акции',
            auth: null
          }

        });

    });

})();
