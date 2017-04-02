'use strict';

(function () {

  function CampaignsController(Schema, saControllerHelper, $scope, $state, GalleryHelper) {

    const {Campaign} = Schema.models();

    const vm = saControllerHelper.setup(this, $scope)
      .use(GalleryHelper)
      .use({
        thumbClick,
        initGroupId: $state.params.campaignGroupId
      });

    /*
     Listeners
     */

    vm.watchScope('vm.campaignGroup.id', campaignGroupId => {

      if (!campaignGroupId) return;

      $state.go('.', {campaignGroupId}, {notify: false});
      vm.setBusy(refresh(campaignGroupId));

    });

    /*
     Functions
     */

    function refresh(campaignGroupId) {
      return Campaign.findAllWithRelations({campaignGroupId})('CampaignPicture')
        .then(campaigns => vm.campaigns = campaigns);
    }

    function thumbClick(campaignPicture) {
      $scope.imagesAll = campaignPicture.campaign.campaignPictures;
      return vm.thumbnailClick(campaignPicture);
    }

  }

  angular.module('webPage')
    .controller('CampaignsController', CampaignsController);

}());
