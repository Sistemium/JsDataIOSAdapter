'use strict';

(function () {

  function CampaignsController(saControllerHelper, $scope, $state, Helpers, FullScreenService) {

    const { GalleryHelper, saMedia, saEtc } = Helpers;

    const vm = saControllerHelper.setup(this, $scope)
      .use(GalleryHelper)
      .use({

        initGroupId: $state.params.campaignGroupId,

        thumbClick,
        showHiddenPic,
        campaignClick(campaign) {
          const content = '<div class="title">{{ campaign.name }}</div>' +
            '<action-view ng-repeat="action in campaign.actions" action="::action"></action-view>';
          FullScreenService.openFullScreen(content, { campaign }, { cls: 'campaign' });
        },

      });

    /*
     Listeners
     */

    vm.watchScope(
      () => saMedia.windowWidth,
      () => vm.limit = getSectionWidth()
    );

    vm.watchScope('vm.campaignGroup.id', campaignGroupId => {

      if (!campaignGroupId) return;

      $state.go('.', { campaignGroupId }, { notify: false });

    });

    /*
     Functions
     */

    function getSectionWidth() {

      const sectionElem = saEtc.getElementById('campaigns-list');

      let currWidth = angular.element(sectionElem)[0].clientWidth;
      let show = Math.floor((currWidth - 40 - 90) / 142);
      return show > 0 ? show : 1

    }

    function showHiddenPic(campaign) {

      if (campaign.id === vm.showCampaignPhotosId) {
        vm.showCampaignPhotosId = '';
      } else {
        vm.showCampaignPhotosId = campaign.id;
      }

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

})();
