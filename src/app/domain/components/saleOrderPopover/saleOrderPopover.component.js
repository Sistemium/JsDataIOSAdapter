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

    function saleOrderPopoverController($scope) {

      let vm = this;

      $scope.draftSaleOrders = vm.items;

      _.assign(vm, {
        saleOrderId: vm.activeId,
        popoverPlacement: vm.popoverPlacement || 'auto bottom-right'
      });

    }

})();
