'use strict';

(function () {

  angular.module('webPage').component('campaignPopover', {

    bindings: {},

    controller: campaignPopoverController,

    templateUrl: 'app/domain/components/campaignPopover/campaignPopover.html',
    controllerAs: 'vm'

  });

  function campaignPopoverController(Schema, $scope, GalleryHelper, localStorageService) {

    const vm = _.assign(this, {
      $onInit,
      thumbClick,
      onElemLoad,
      isPopoverOpen: false
    });

    GalleryHelper.setupController(vm, $scope);

    const {Campaign, CampaignGroup} = Schema.models();

    $scope.$watch('vm.isPopoverOpen', (nv, ov) => {

      if (nv == false && (nv !== ov)) {
        let elem = document.getElementsByClassName('campaign-popover-template')[0];
        localStorageService.set('campaignPopoverTopScroll', elem.scrollTop);
      }

    });


    function $onInit() {

      let today = moment().format();

      CampaignGroup.findAll()
        .then(groups => {

          vm.campaignGroup = _.find(groups, group => group.dateB <= today && today <= group.dateE);

          let filter = {campaignGroupId: vm.campaignGroup.id};

          Campaign.findAllWithRelations(filter)('CampaignPicture')
            .then(campaigns => {

              vm.campaigns = _.filter(campaigns, (elem) => {
                return elem.campaignPictures.length > 0
              });

            });

        });

    }

    function thumbClick(picture) {

      vm.isPopoverOpen = false;

      let campaign = picture.campaign;

      vm.commentText = campaign.commentText;
      $scope.imagesAll = campaign.campaignPictures;

      vm.thumbnailClick(picture);

    }


    function onElemLoad() {

      let elem = document.getElementsByClassName('campaign-popover-template')[0];
      let scrollTo = localStorageService.get('campaignPopoverTopScroll') || 0;

      if (scrollTo > elem.scrollHeight) {
        scrollTo = 0;
      }

      elem.scrollTop = scrollTo;
    }

  }

})();
