'use strict';

(function () {

  angular.module('webPage').component('campaignPopover', {

    bindings: {},

    controller: campaignPopoverController,

    templateUrl: 'app/domain/components/campaignPopover/campaignPopover.html',
    controllerAs: 'vm'

  });

  function campaignPopoverController(Schema, $scope, GalleryHelper) {

    const vm = _.assign(this, {
      $onInit,
      thumbClick
    });

    GalleryHelper.setupController(vm, $scope);

    const {Campaign, CampaignGroup} = Schema.models();

    function $onInit() {

      let today = moment().format();

      CampaignGroup.findAll()
        .then(groups => {

          vm.campaignGroup = _.find(groups, group => group.dateB <= today && today <= group.dateE);

          let filter = {campaignGroupId: vm.campaignGroup.id};

          Campaign.findAllWithRelations(filter)('CampaignPicture')
            .then(campaigns => vm.campaigns = campaigns);

          // TODO: remember scroll position on destroy and restore it on init

        });

    }

    function thumbClick(picture) {

      vm.isPopoverOpen = false;

      let campaign = picture.campaign;

      vm.commentText = campaign.commentText;
      $scope.imagesAll = campaign.campaignPictures;

      vm.thumbnailClick(picture);

    }

  }

})();
