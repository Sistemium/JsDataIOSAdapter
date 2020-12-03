'use strict';

(function () {

  const TEAM_ID_KEY = 'campaignsTeamId';

  angular.module('Sales').component('campaignFilterPopover', {


    bindings: {
      currentItem: '=',
      initItemId: '<',
      currentTeam: '=',
      campaigns: '=',
      busy: '='
    },

    controller: campaignFilterPopoverController,

    templateUrl: 'app/domain/components/campaignFilterPopover/campaignFilterPopover.html',
    controllerAs: 'vm'

  });

  function campaignFilterPopoverController(Schema, localStorageService) {

    const vm = _.assign(this, {
      $onInit,
      $onDestroy() {
        localStorageService.set(TEAM_ID_KEY, this.currentTeam && this.currentTeam.name);
      },
      itemClick,
      currentTeamId: localStorageService.get(TEAM_ID_KEY),
      teamClick,
    });

    const { CampaignGroup, Campaign } = Schema.models();

    function $onInit() {

      const today = moment().format();

      CampaignGroup.findAll(CampaignGroup.meta.filterActual())
        .then(groups => {

          vm.campaignGroups = groups;
          vm.currentItem = vm.initItemId
            && _.find(groups, { id: vm.initItemId })
            || _.find(vm.campaignGroups, group => group.dateB <= today && today <= group.dateE);

          return campaignGroupsSearch(vm.currentItem);

        });


    }

    function campaignGroupsSearch(campaignGroup) {

      const res = Campaign.meta.findWithPictures(campaignGroup)
        .then(campaigns => {

          const campaignsFilteredByPhoto = _.filter(campaigns, campaign => {
            campaign.showAllPhotos = false;
            campaign.photoCount = _.get(campaign, 'campaignPictures.length');
            return campaign.photoCount + _.get(campaign, 'actions.length');
          });

          vm.teams = Campaign.meta.teamsWithPriorities(campaignsFilteredByPhoto, campaignGroup);
          vm.campaigns = campaignsFilteredByPhoto;
          vm.currentTeam = _.find(vm.teams, { name: vm.currentTeamId });
          if (!vm.currentTeam) {
            vm.currentTeamId = null;
          }

        });

      vm.busy = res;

      return res;

    }

    function itemClick(item) {
      campaignGroupsSearch(item);
      vm.isGroupPopoverOpen = false;
      vm.currentItem = item;
      // vm.currentTeam = '';
    }

    function teamClick(team) {
      vm.isTeamNamePopoverOpen = false;
      vm.currentTeam = team;
    }

  }

})();
