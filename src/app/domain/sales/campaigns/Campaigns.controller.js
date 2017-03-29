'use strict';

(function () {

  function CampaignsController(Schema, saControllerHelper, $scope, SalesmanAuth, $state) {

    const {CampaignGroup, Campaign/*, CampaignPicture*/} = Schema.models();
    let vm = saControllerHelper.setup(this, $scope);

    vm.use({

      campaignGroups: [],
      selectedCampaignGroup: $state.params.campaignGroup,
      campaigns: [],

      campaignGroupClick,
      campaignClick

    });

    /*
     Listeners
     */

    SalesmanAuth.watchCurrent($scope, salesman => {

      vm.selectedSalesmanId = _.get(salesman, 'id');
      loadCampaignsData();

    });

    // $scope.$on('rootClick', () => $state.go('sales.visits'));

    /*
     Functions
     */

    function loadCampaignsData() {

      if (!vm.selectedCampaignGroup) {

        loadCampaignGroups();
        return;

      }

      loadCampaigns();

    }

    function loadCampaignGroups() {

      CampaignGroup.findAll({}, {bypassCache: true})
        .then((campaignGroups) => {

          vm.campaignGroups = campaignGroups;
          console.info('vm.campaignGroups', vm.campaignGroups);

        });

    }

    function loadCampaigns() {

      Campaign.findAll({campaignGroupId: vm.selectedCampaignGroup.id}, {bypassCache: true})
        .then((campaigns) => {

          vm.campaigns = campaigns;
          console.info('vm.campaigns', vm.campaigns);

        });

    }

    function campaignGroupClick(campaignGroup) {

      console.info('campaignGroupClick', campaignGroup);
      $state.go('.', {campaignGroup: campaignGroup.id});

    }

    function campaignClick(campaign) {
      console.info('campaignClick', campaign);
    }

  }

  angular.module('webPage')
    .controller('CampaignsController', CampaignsController);

}());
