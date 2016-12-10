'use strict';

(function () {

  angular.module('webPage')
    .component('saleOrderPopover', {

      bindings: {
        items: '=',
        activeId: '=?'
      },

      transclude: true,

      templateUrl: 'app/domain/components/saleOrderPopover/saleOrderPopover.trigger.html',
      controller: saleOrderPopoverController,
      controllerAs: 'vm'

    });

    function saleOrderPopoverController() {

      let vm = this;

      _.assign(vm, {

      });

    }

})();
