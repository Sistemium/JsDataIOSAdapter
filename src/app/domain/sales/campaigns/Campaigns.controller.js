(function () {

  const CAMPAIGN_SHOW_PICTURES_KEY = 'showCampaignPictures';

  function CampaignsController(saControllerHelper, $scope, $state, Helpers, localStorageService, FullScreenService) {

    const { GalleryHelper, saMedia, saEtc } = Helpers;

    const vm = saControllerHelper.setup(this, $scope)
      .use(GalleryHelper)
      .use({

        $onInit() {
          this.showPictures = localStorageService.get(CAMPAIGN_SHOW_PICTURES_KEY);
        },

        initGroupId: $state.params.campaignGroupId,

        thumbClick,
        showHiddenPic,
        campaignClick(campaign) {
          const content = '<campaign-view campaign="campaign" show-pictures="true"></campaign-view>';
          const options = {
            cls: 'campaign',
            title: campaign.title,
            // buttons: [{
            //   icon: 'glyphicon glyphicon-picture',
            //   cls: 'btn-primary',
            //   onClick() {
            //     vm.showPictures = !vm.showPictures;
            //     localStorageService.set(CAMPAIGN_SHOW_PICTURES_KEY, vm.showPictures);
            //   },
            // }],
          };
          const params = {
            campaign,
            // showPictures: this.showPictures,
          };
          FullScreenService.openFullScreen(content, params, options);
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
