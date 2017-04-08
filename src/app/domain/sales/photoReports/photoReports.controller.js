'use strict';

(function () {

  function PhotoReportsController(Schema, Helpers, $scope, SalesmanAuth, $state, GalleryHelper) {

    const {Partner, Campaign/*, PhotoReport, Outlet*/} = Schema.models();
    const {saMedia, saControllerHelper} = Helpers;

    const vm = saControllerHelper.setup(this, $scope)
      .use(GalleryHelper)
      .use({

        selectedOutletId: $state.params.outletId,
        selectedCampaignId: $state.params.campaignId,

        takePhoto,
        outletClick,
        campaignClick,
        thumbClick,
        rowHeight

      });

    if (!vm.selectedOutletId) {
      loadOutlets();
    } else {
      loadCampaigns();
    }

    function loadOutlets() {

      let filter = SalesmanAuth.makeFilter();

      return Partner.findAllWithRelations(filter, {bypassCache: true})(['Outlet'])
        .then(partners => vm.partners = partners);

    }

    function loadCampaigns() {

      return Campaign.findAllWithRelations()('PhotoReport')
        .then(campaigns => vm.campaigns = campaigns);

    }

    function takePhoto() {

      console.info('takePhoto()');
      // $state.go('sales.territory');
      // return PhotoHelper.takePhoto('PhotoReport', {visitId: vm.visit.id}, vm.thumbnails);

    }

    function outletClick(outlet) {

      console.info('outletClick', outlet);
      $state.go('.', {outletId: outlet.id});
    }

    function campaignClick(campaign) {

      console.info('campaignClick', campaign);
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
