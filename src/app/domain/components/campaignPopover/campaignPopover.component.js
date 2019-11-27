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
      teamIdx: getTeamIdx()
    });

    GalleryHelper.setupController(vm, $scope);

    const {Campaign, CampaignGroup} = Schema.models();

    $scope.$watch('vm.isPopoverOpen', (nv, ov) => {

      if (!nv && nv != ov) {
        let elem = getScrollerElement();
        if (!elem) return;
        localStorageService.set('campaignPopoverTopScroll', elem.scrollTop);
      }

      if (nv && !vm.busy) {
        vm.busy = loadData()
          .finally(() => vm.ready = true);
      }

    });

    function $onInit() {

    }

    function loadData() {

      let today = moment().format();

      return CampaignGroup.findAll()
        .then(groups => {

          vm.campaignGroup = _.find(groups, group => group.dateB <= today && today <= group.dateE);

          if (!vm.campaignGroup) return;

          return Campaign.meta.findWithPictures(vm.campaignGroup)
            .then(campaigns => {

              // FIXME: copy-pasted in campaignFilterPopover

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

      // vm.isPopoverOpen = false;

      let campaign = picture.campaign;

      vm.commentText = campaign.commentText;
      $scope.imagesAll = campaign.campaignPictures;

      vm.thumbnailClick(picture);

    }

    function getTeamIdx() {
      return localStorageService.get('campaignTeamIdx') || 1;
    }

    function getTopScrollPosition() {
      return localStorageService.get('campaignPopoverTopScroll') || 0;
    }

    function getScrollerElement() {
      return document.getElementById('campaign-popover-scroll');
    }

    function onElemLoad() {
      vm.teamIdx = getTeamIdx();
      let scrollToPx = getTopScrollPosition();
      scrollTo(scrollToPx);
    }

    function onTeamSelect(team, idx) {
      vm.selectedTeam = team;
      scrollTo(0);
      localStorageService.set('campaignTeamIdx', idx + 1);
    }


    function scrollTo(height) {

      let elem = getScrollerElement();

      if (!elem) return;

      if (height > elem.scrollHeight) {
        height = 0;
        localStorageService.set('campaignPopoverTopScroll', height);
      }

      elem.scrollTop = height;

    }

  }

})();
