'use strict';

(function () {

  angular.module('webPage')
    .component('saleOrderPopover', {

      bindings: {
        items: '=',
        activeId: '=?',
        popoverPlacement: '@'
      },

      transclude: true,

      templateUrl: 'app/domain/components/saleOrderPopover/saleOrderPopover.trigger.html',
      controller: saleOrderPopoverController,
      controllerAs: 'vm'

    });

    function saleOrderPopoverController() {

      let vm = this;

      _.assign(vm, {
        popoverPlacement: vm.popoverPlacement || 'auto bottom-right'
      });

    }

})();
