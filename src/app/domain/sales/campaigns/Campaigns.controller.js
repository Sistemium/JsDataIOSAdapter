'use strict';

(function () {

  function CampaignsController(Schema, saControllerHelper, $scope, $state, GalleryHelper, localStorageService) {

    const {Campaign} = Schema.models();

    const vm = saControllerHelper.setup(this, $scope)
      .use(GalleryHelper)
      .use({
        thumbClick,
        currentItem: localStorageService.get('lastState').params.campaignGroupId || '',
        currentTeam: '',
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
        .then(campaigns => {

          vm.campaigns = _.filter(campaigns, function (campaign) {
            return campaign.campaignPictures.length
          });

        })
        .catch(e => console.error(e));

    }

    function thumbClick(picture) {

      let campaign = picture.campaign;

      vm.commentText = campaign.commentText;
      $scope.imagesAll = campaign.campaignPictures;

      return vm.thumbnailClick(picture);
    }

  }

  angular.module('webPage')
    .controller('CampaignsController', CampaignsController);

}());
