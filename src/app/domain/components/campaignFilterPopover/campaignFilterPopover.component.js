'use strict';

(function () {

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

  function campaignFilterPopoverController(Schema) {

    const vm = _.assign(this, {
      $onInit,
      itemClick,
      teamClick
    });

    const {CampaignGroup, Campaign} = Schema.models();

    function $onInit() {

      let today = moment().format();

      CampaignGroup.findAll()
        .then(groups => {

          vm.campaignGroups = groups;

          if (vm.initItemId) {
            vm.currentItem = _.find(groups, {id: vm.initItemId});
            if (vm.currentItem) {
              campaignGroupsSearch(vm.currentItem);
              return;
            }
          }

          vm.currentItem = _.find(vm.campaignGroups, group => group.dateB <= today && today <= group.dateE);
          campaignGroupsSearch(vm.currentItem);

        });


    }

    function campaignGroupsSearch(campaignGroup) {

      vm.busy = Campaign.findAllWithRelations(Campaign.meta.filterByGroup(campaignGroup))(['CampaignPicture'])
        .then(campaigns => {

          let campaignsFilteredByPhoto = _.filter(campaigns, campaign => {
            campaign.showAllPhotos = false;
            return (campaign.photoCount = _.get(campaign, 'campaignPictures.length'));
          });

          vm.teams = _.map(_.groupBy(campaignsFilteredByPhoto, 'teamName'), (campaigns, name) => {
            return {
              name
            };
          });

          vm.campaigns = campaignsFilteredByPhoto;

        });

    }

    function itemClick(item) {
      campaignGroupsSearch(item);
      vm.isGroupPopoverOpen = false;
      vm.currentItem = item;
      vm.currentTeam = '';
    }

    function teamClick(team) {
      vm.isTeamNamePopoverOpen = false;
      vm.currentTeam = team.name
    }

  }

})();
