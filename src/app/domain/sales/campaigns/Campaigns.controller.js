'use strict';

(function () {

  function CampaignsController(Schema, saControllerHelper, $scope, $state, GalleryHelper, localStorageService, $window) {

    const {Campaign} = Schema.models();
    const sectionElem = document.getElementsByClassName('campaigns');
    const appWindow = angular.element($window);

    const vm = saControllerHelper.setup(this, $scope)
      .use(GalleryHelper)
      .use({
        thumbClick,
        currentItem: localStorageService.get('lastState').params.campaignGroupId || '',
        currentTeam: '',
        initGroupId: $state.params.campaignGroupId,
        showPhotos: '',
        showHiddenPic,
        limit: getSectionWidth()
      });

    /*
     Listeners
     */

    appWindow.bind('resize', function () {
      vm.limit = getSectionWidth()
    });


    vm.watchScope('vm.campaignGroup.id', campaignGroupId => {

      if (!campaignGroupId) return;

      $state.go('.', {campaignGroupId}, {notify: false});
      vm.setBusy(refresh(campaignGroupId));

    });

    $scope.$on('$stateChangeStart', onStateChange);


    /*
     Functions
     */

    function getSectionWidth() {
      let currWidth = angular.element(sectionElem)[0].clientWidth;
      let show = Math.floor((currWidth - 40 - 90) / 142);
      return show > 0 ? show : 1
    }

    function onStateChange() {
      appWindow.unbind();
    }

    function showHiddenPic(campaign) {

      if (campaign.id == vm.showCampaignPhotosId) {
        vm.showCampaignPhotosId = '';
      } else {
        vm.showCampaignPhotosId = campaign.id;
      }

    }

    function refresh(campaignGroupId) {

      return Campaign.findAllWithRelations({campaignGroupId})('CampaignPicture')
        .then(campaigns => {
          vm.campaigns = _.filter(campaigns, function (campaign) {
            campaign.showAllPhotos = false;
            campaign.photoCount = campaign.campaignPictures.length;
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
