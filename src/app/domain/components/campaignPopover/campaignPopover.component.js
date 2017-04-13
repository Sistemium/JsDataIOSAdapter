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

              vm.campaignsDup = vm.campaigns;

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
      vm.team = localStorageService.get('campaignTeam') || false;
      let scrollToPx = localStorageService.get('campaignPopoverTopScroll') || 0;
      vm.campaignsDup = teamsFilter();
      scrollTo(scrollToPx);
    }

    function onTeamSelect(team) {

      localStorageService.set('campaignPopoverTopScroll', 0);
      scrollTo(0);

      vm.team = team;
      vm.campaignsDup = teamsFilter();
      localStorageService.set('campaignTeam', team);
    }

    function scrollTo(height) {

      let elem = document.getElementsByClassName('campaign-popover-template')[0];

      if (height > elem.scrollHeight) {
        height = 0;
      }

      elem.scrollTop = height;

    }

    function teamsFilter() {
      return _.filter(vm.campaigns, function (campaign) {
        return campaign.teamName == vm.team
      });
    }

  }

})();
