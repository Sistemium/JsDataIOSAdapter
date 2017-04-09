'use strict';

(function () {

  function PhotoReportsController(Schema, Helpers, $scope, SalesmanAuth, $state, GalleryHelper) {

    const {Partner, Campaign, Outlet, PhotoReport} = Schema.models();
    const {saMedia, saControllerHelper, PhotoHelper} = Helpers;

    const vm = saControllerHelper.setup(this, $scope)
      .use(GalleryHelper)
      .use({

        selectedOutletId: $state.params.outletId,
        selectedCampaignId: $state.params.campaignId,
        initGroupId: $state.params.campaignGroupId,
        photoReports: {},
        thumbnails: {},

        takePhoto,
        outletClick,
        campaignClick,
        thumbClick,
        rowHeight

      });

    vm.onScope('rootClick', () => $state.go('.', {outletId: null, campaignId: null}));

    vm.watchScope('vm.campaignGroup.id', campaignGroupId => {

      if (!campaignGroupId) return;

      $state.go('.', {campaignGroupId}, {notify: false});
      vm.setBusy(loadCampaigns(campaignGroupId));

    });

    if (!vm.selectedOutletId) {

      loadOutlets();

    } else if (!vm.selectedCampaignId) {

      loadOutlet(vm.selectedOutletId);
      loadCampaigns();

    } else  {

      loadOutlet(vm.selectedOutletId);
      loadCampaign(vm.selectedCampaignId);

    }

    function loadOutlets() {

      let filter = SalesmanAuth.makeFilter();

      return Partner.findAllWithRelations(filter, {bypassCache: true})(['Outlet'])
        .then(partners => vm.partners = partners);

    }

    function loadOutlet(outletId) {

      Outlet.find(outletId)
        .then(outlet => vm.outlet = outlet);

    }

    function loadCampaigns(campaignGroupId) {

      // return Campaign.findAllWithRelations({campaignGroupId})('PhotoReport')
      //   .then(campaigns => vm.campaigns = campaigns);

      return Campaign.findAll({campaignGroupId})
        .then(campaigns => vm.campaigns = campaigns)
        .then(loadPhotoReports());

    }

    function loadPhotoReports() {

      _.forEach(vm.campaigns, campaign => {
        photoReportsForCampaign(campaign.id);
      });

    }

    function photoReportsForCampaign(campaignId) {

      let filter = {
        outletId  : vm.selectedOutletId,
        campaignId: campaignId,
        salesmanId: SalesmanAuth.getCurrentUser().id
      };

      PhotoReport.findAll(filter, {bypassCache: true})
        .then(photoReports => {
          vm.photoReports[campaignId] = photoReports;
        });

    }

    function loadCampaign(campaignId) {

      Campaign.find(campaignId)
        .then(campaign => vm.campaign = campaign)
        .then(photoReportsForCampaign(campaignId));

    }

    function takePhoto() {

      let photoReportData = {
        outletId    : vm.selectedOutletId,
        campaignId  : vm.selectedCampaignId,
        salesmanId  : SalesmanAuth.getCurrentUser().id
      };

      console.info('photoReportData', photoReportData);

      return PhotoHelper.takePhoto('PhotoReport', photoReportData, vm.thumbnails);

    }

    function outletClick(outlet) {
      $state.go('.', {outletId: outlet.id, campaignId: null});
    }

    function campaignClick(campaign) {
      $state.go('.', {outletId: vm.selectedOutletId, campaignId: campaign.id});
    }

    function thumbClick(picture) {

      let campaign = picture.campaign;

      vm.commentText = campaign.commentText;
      $scope.imagesAll = campaign.campaignPictures;

      return vm.thumbnailClick(picture);

    }

    function rowHeight(partner) {

      let xsMargin = (saMedia.xsWidth || saMedia.xxsWidth) ? 21 : 0;
      return 39 + partner.outlets.length * 29 + 8 + 17 - xsMargin;

    }

  }

  angular.module('webPage')
    .controller('PhotoReportsController', PhotoReportsController);

}());
