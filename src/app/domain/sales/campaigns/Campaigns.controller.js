'use strict';

(function () {

  function CampaignsController(Schema, saControllerHelper, $scope, $state, GalleryHelper, localStorageService, $window) {

    const {Campaign} = Schema.models();

    const vm = saControllerHelper.setup(this, $scope)
      .use(GalleryHelper)
      .use({
        thumbClick,
        currentItem: localStorageService.get('lastState').params.campaignGroupId || '',
        currentTeam: '',
        initGroupId: $state.params.campaignGroupId,
        showPhotos: '',
        showHiddenPic
      });

    /*
     Listeners
     */

    //TODO: Refactor

    var sectionElem = document.getElementsByClassName("campaigns");
    var wrappedSectionElem = angular.element(sectionElem)[0].clientWidth;

    vm.limit = Math.floor((wrappedSectionElem - 10 - 124) / 142);

    var appWindow = angular.element($window);

    appWindow.bind('resize', function () {
      var currWidth = angular.element(sectionElem)[0].clientWidth;
      vm.limit = Math.floor((currWidth - 10 - 124) / 142);
    });


    vm.watchScope('vm.campaignGroup.id', campaignGroupId => {

      if (!campaignGroupId) return;

      $state.go('.', {campaignGroupId}, {notify: false});
      vm.setBusy(refresh(campaignGroupId));

    });


    /*
     Functions
     */

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
