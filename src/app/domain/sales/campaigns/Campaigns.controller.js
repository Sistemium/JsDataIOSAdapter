'use strict';

(function () {

  function CampaignsController(Schema, saControllerHelper, $scope, SalesmanAuth, $state) {

    const {CampaignGroup, Campaign, CampaignPicture} = Schema.models();
    let vm = saControllerHelper.setup(this, $scope);

    vm.use({

      campaignGroups: [],
      selectedCampaignGroupId: $state.params.campaignGroupId,
      selectedCampaignGroup: undefined,

      campaigns: [],
      selectedCampaignId: $state.params.campaignId,
      selectedCampaign: undefined,

      campaignPictures: [],

      campaignGroupClick,
      campaignClick,
      campaignPictureClick

    });

    /*
     Listeners
     */

    SalesmanAuth.watchCurrent($scope, salesman => {

      vm.selectedSalesmanId = _.get(salesman, 'id');

      vm.setBusy(
        loadData(),
        'Загрузка акций'
      );

    });

    $scope.$on('rootClick', () => $state.go('.', {campaignGroupId: null, campaignId: null}));

    /*
     Functions
     */

    function loadData() {

      if (vm.selectedCampaignId) {
        return loadCampaignPictures();
      }

      if (vm.selectedCampaignGroupId) {
        return loadCampaigns();
      }

      return loadCampaignGroups();

    }

    function loadCampaignPictures() {

      if (!vm.selectedCampaignId) return;

      return loadSelectedCampaign()
        .then(loadPicturesForSelectedCampaign());

    }

    function loadSelectedCampaign() {

      if (!vm.selectedCampaignId) return;

      return Campaign.findAllWithRelations({id: vm.selectedCampaignId}, {bypassCache: true})('CampaignGroup')
        .then((selectedCampaigns) => {

          vm.selectedCampaign = _.first(selectedCampaigns);
          vm.selectedCampaignGroupId = vm.selectedCampaignGroupId || vm.selectedCampaign.campaignGroupId;

        })
        .then(loadSelectedCampaignGroup());

    }

    function loadPicturesForSelectedCampaign() {

      if (!vm.selectedCampaignId) return;

      return CampaignPicture.findAll({campaignId: vm.selectedCampaignId}, {bypassCache: true})
        .then((campaignPictures) => {
          vm.campaignPictures = campaignPictures;
        });

    }

    function loadCampaigns() {

      if (!vm.selectedCampaignGroupId) return;

      return loadSelectedCampaignGroup()
        .then(loadCampaignsForSelectedGroup());

    }

    function loadSelectedCampaignGroup() {

      if (!vm.selectedCampaignGroupId) return;

      return CampaignGroup.find(vm.selectedCampaignGroupId)
        .then((selectedCampaignGroup) => {
          vm.selectedCampaignGroup = selectedCampaignGroup;
        });

    }

    function loadCampaignsForSelectedGroup() {

      if (!vm.selectedCampaignGroupId) return;

      return Campaign.findAllWithRelations({campaignGroupId: vm.selectedCampaignGroupId}, {bypassCache: true})('CampaignPicture')
        .then((campaigns) => {
          vm.campaigns = campaigns;
        });

    }

    function loadCampaignGroups() {

      return CampaignGroup.findAllWithRelations({}, {bypassCache: true})('Campaign')
        .then((campaignGroups) => {
          vm.campaignGroups = campaignGroups;
        });

    }

    function campaignGroupClick(campaignGroup) {
      $state.go('.', {campaignGroupId: campaignGroup.id});
    }

    function campaignClick(campaign) {
      $state.go('.', {campaignId: campaign.id});
    }

    function campaignPictureClick(campaignPicture) {
    }

  }

  angular.module('webPage')
    .controller('CampaignsController', CampaignsController);

}());
