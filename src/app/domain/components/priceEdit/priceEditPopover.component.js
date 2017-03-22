'use strict';

(function (module) {

  const priceEditPopover = {

    bindings: {
      popoverOpen: '<',
      position: '<'
    },

    templateUrl: 'app/domain/components/priceEdit/priceEditPopover.html',

    controller: priceEditController,
    controllerAs: 'vm'

  };

  /** @ngInject */
  function priceEditController($scope) {

    let vm = this;

    _.assign(vm, {

      ksButtonClick,
      $onInit

    });

    /*
     Init
     */

    function $onInit() {
      _.assign(vm, _.pick(vm.position, ['price', 'priceOrigin', 'priceDoc']));
    }

    /*
     Listeners
     */

    $scope.$watch('vm.price', onPriceChange);

    /*
     Functions
     */

    function onPriceChange(newPrice) {

      if (!newPrice) return;

      let price = parseFloat(newPrice);

      if (!price || Math.abs(price - vm.position.price) < 0.01) return;

      vm.position.price = price;
      vm.position.updateCost();
      vm.position.saleOrder.updateTotalCost();

    }

    function ksButtonClick() {
      vm.position.isCompDiscount = !vm.position.isCompDiscount;
      vm.position.DSSave();
    }


  }

  module.component('priceEditPopover', priceEditPopover);

})(angular.module('Sales'));
