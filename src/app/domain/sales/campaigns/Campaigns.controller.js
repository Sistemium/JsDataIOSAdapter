'use strict';

(function () {

  function CampaignsController(Schema, saControllerHelper, $scope, SalesmanAuth, $state) {

    const {CampaignGroup, Campaign/*, CampaignPicture*/} = Schema.models();
    let vm = saControllerHelper.setup(this, $scope);

    vm.use({

      campaignGroups: [],
      selectedCampaignGroupId: $state.params.campaignGroupId,
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

    $scope.$on('rootClick', () => $state.go('.', {campaignGroupId: null}));

    /*
     Functions
     */

    function loadCampaignsData() {

      if (!vm.selectedCampaignGroupId) {

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
      $state.go('.', {campaignGroupId: campaignGroup.id});

    }

    function campaignClick(campaign) {
      console.info('campaignClick', campaign);
    }

  }

  angular.module('webPage')
    .controller('CampaignsController', CampaignsController);

}());
