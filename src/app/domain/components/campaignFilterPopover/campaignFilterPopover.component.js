'use strict';

(function () {

  angular.module('Sales').component('campaignFilterPopover', {


    bindings: {
      currentItem: '=',
      initItemId: '<',
      currentTeam: '='
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
            campaignGroupsSearch(vm.initItemId);
            vm.currentItem = _.find(groups, {id: vm.initItemId});
            if (vm.currentItem) return;
          }
          vm.currentItem = _.find(vm.campaignGroups, group => group.dateB <= today && today <= group.dateE);
          campaignGroupsSearch(vm.currentItem.id);

        });


    }

    function campaignGroupsSearch(campaignGroupId) {

      let filter = {campaignGroupId: campaignGroupId};

      return Campaign.findAllWithRelations(filter)(['CampaignPicture'])
        .then(campaigns => {

          let campaignsFilteredByPhoto = _.filter(campaigns, (elem) => {
            return elem.campaignPictures.length > 0
          });

          vm.teams = _.map(_.groupBy(campaignsFilteredByPhoto, 'teamName'), (campaigns, name) => {
            return {
              name
            };
          });

        });

    }

    function itemClick(item) {
      campaignGroupsSearch(item.id);
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