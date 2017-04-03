'use strict';

(function () {

  angular.module('Sales').component('campaignGroupPopover', {

    bindings: {
      currentItem: '=',
      initItemId: '<'
    },

    controller: campaignGroupPopoverController,

    templateUrl: 'app/domain/components/campaignGroupPopover/campaignGroupPopover.html',
    controllerAs: 'vm'

  });

  function campaignGroupPopoverController(Schema) {

    const vm = _.assign(this, {
      $onInit,
      itemClick
    });

    const {CampaignGroup} = Schema.models();

    function $onInit() {

      let today = moment().format();

      // TODO: use groupBy to show groups only with campaigns

      CampaignGroup.findAll()
        .then(groups => {

          vm.items = groups;

          if (vm.initItemId) {
            vm.currentItem = _.find(groups, {id: vm.initItemId});
            if (vm.currentItem) return;
          }

          vm.currentItem = _.find(groups, group => group.dateB <= today && today <= group.dateE);

        });

    }

    function itemClick(item) {
      vm.isPopoverOpen = false;
      vm.currentItem = item;
    }

  }

})();
