'use strict';

(function () {

  function CampaignsController(Schema, saControllerHelper, $scope, SalesmanAuth, $state) {

    const {CampaignGroup, Campaign/*, CampaignPicture*/} = Schema.models();
    let vm = saControllerHelper.setup(this, $scope);

    vm.use({

      campaignGroups: [],
      selectedCampaignGroupId: $state.params.campaignGroupId,
      selectedCampaignGroup: undefined,
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

      CampaignGroup.findAllWithRelations({}, {bypassCache: true})('Campaign')
        .then((campaignGroups) => {

          vm.campaignGroups = campaignGroups;
          console.info('vm.campaignGroups', vm.campaignGroups);

        });

    }

    function loadCampaigns() {

      if (!vm.selectedCampaignGroupId) return;

      loadSelectedCampaignGroup()
        .then(loadSelectedCampaigns());

    }

    function loadSelectedCampaignGroup() {

      if (!vm.selectedCampaignGroupId) return;

      return CampaignGroup.find(vm.selectedCampaignGroupId)
        .then((selectedCampaignGroup) => {
          vm.selectedCampaignGroup = selectedCampaignGroup;
        });

    }

    function loadSelectedCampaigns() {

      if (!vm.selectedCampaignGroupId) return;

      return Campaign.findAll({campaignGroupId: vm.selectedCampaignGroupId}, {bypassCache: true})
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
