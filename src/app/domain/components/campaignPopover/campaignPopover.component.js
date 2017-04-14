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
      onTeamSelect,
      isPopoverOpen: false,
      teamIdx: localStorageService.get('campaignTeamIdx') || 0,
    });

    GalleryHelper.setupController(vm, $scope);

    const {Campaign, CampaignGroup} = Schema.models();

    $scope.$watch('vm.isPopoverOpen', (nv, ov) => {

      if (!nv && nv !== ov) {
        let elem = getScrollerElement();
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

              vm.teams = _.map(_.groupBy(vm.campaigns, 'teamName'), (campaigns, name) => {
                return {
                  name,
                  campaigns
                };
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
      vm.teamIdx = localStorageService.get('campaignTeamIdx') || 1;
      let scrollToPx = localStorageService.get('campaignPopoverTopScroll') || 0;
      scrollTo(scrollToPx);
    }

    function onTeamSelect(team, idx) {
      vm.selectedTeam = team;
      scrollTo(0);
      localStorageService.set('campaignTeamIdx', idx + 1);
    }

    function getScrollerElement() {
      return document.getElementById('campaign-popover-scroll');
    }

    function scrollTo(height) {

      let elem = getScrollerElement();

      if (height > elem.scrollHeight) {
        height = 0;
        localStorageService.set('campaignPopoverTopScroll', 0);
      }

      elem.scrollTop = height;

    }

  }

})();
