'use strict';

(function () {

  function CampaignsController(Schema, saControllerHelper, $scope, SalesmanAuth) {

    const {CampaignGroup/*, Campaign, CampaignPicture*/} = Schema.models();
    let vm = saControllerHelper.setup(this, $scope);

    vm.use({

      campaignGroups: [],
      campaigns: []

    });

    /*
     Listeners
     */

    SalesmanAuth.watchCurrent($scope, salesman => {

      vm.selectedSalesmanId = _.get(salesman, 'id');
      findCampaigns();

    });

    // $scope.$on('rootClick', () => $state.go('sales.visits'));

    /*
     Functions
     */

    function findCampaigns() {

      CampaignGroup.findAll({}, {bypassCache: true})
        .then((campaignGroups) => {

          vm.campaignGroups = campaignGroups;
          console.info('vm.campaignGroups', vm.campaignGroups);

        });

    }

  }

  angular.module('webPage')
    .controller('CampaignsController', CampaignsController);

}());
